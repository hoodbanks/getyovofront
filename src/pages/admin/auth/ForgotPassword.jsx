import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../config/apiConfig';
import { useAuthStore } from '../../../store/useAuthStore';
import logo from '../../../assets/images/GetYovo-Logo2.png';
import bgImage1 from '../../../assets/images/login-background2.png';
import bgImage2 from '../../../assets/images/login-background3.png';
import bgImage3 from '../../../assets/images/login-background4.png';

const endpoints = {
    request: '/superadmin/auth/forgot-password-otp',
    verify: '/superadmin/auth/verify-password-otp',
    setPassword: '/superadmin/auth/set-password',
};

const retryAfterSeconds = (value) => {
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
    const retryAt = Date.parse(value);
    return Number.isNaN(retryAt) ? 0 : Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
};

const publicPost = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    let result;
    try {
        result = await response.json();
    } catch {
        result = null;
    }
    if (!response.ok || !result?.success) {
        const error = new Error(result?.error?.message || result?.message || 'The request could not be completed. Please try again.');
        error.status = response.status;
        error.retryAfterSeconds = retryAfterSeconds(response.headers.get('Retry-After'));
        throw error;
    }
    return result;
};

const passwordRules = [
    ['At least 8 characters', (value) => value.length >= 8],
    ['One uppercase letter', (value) => /[A-Z]/.test(value)],
    ['One lowercase letter', (value) => /[a-z]/.test(value)],
    ['One number', (value) => /[0-9]/.test(value)],
    ['One special character', (value) => /[^A-Za-z0-9]/.test(value)],
];

const safeMessage = (error, fallback) => {
    if (error?.status === 429) return 'Too many attempts. Please wait before trying again.';
    if (error?.status === 400 && error.message && !/(?:stack trace|internal server error|\bat\s+\S+\s*\(|\bat\s+\S+\.js:\d+)/i.test(error.message)) return error.message;
    if (error?.status === 0) return 'Unable to reach the server. Check your connection and try again.';
    return fallback;
};

const ForgotPassword = () => {
    const [step, setStep] = useState('email');
    const [emailInput, setEmailInput] = useState('');
    const [email, setEmail] = useState('');
    const [challengeId, setChallengeId] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);
    const [resendAt, setResendAt] = useState(0);
    const [challengeExpiresAt, setChallengeExpiresAt] = useState(0);
    const [resetTokenExpiresAt, setResetTokenExpiresAt] = useState(0);
    const [now, setNow] = useState(Date.now());
    const navigate = useNavigate();
    const validPasswordRules = useMemo(() => passwordRules.map(([, test]) => test(newPassword)), [newPassword]);
    const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (step === 'verify' && challengeExpiresAt && now >= challengeExpiresAt) {
            setStep('email');
            setChallengeId('');
            setOtp('');
            setResendAt(0);
            setError('That reset code has expired. Request a new code to continue.');
        }
        if (step === 'password' && resetTokenExpiresAt && now >= resetTokenExpiresAt) {
            setResetToken('');
            setResetTokenExpiresAt(0);
            setChallengeExpiresAt(0);
            setChallengeId('');
            setOtp('');
            setResendAt(0);
            setStep('email');
            setError('Your reset session expired. Request a new code to continue.');
        }
    }, [step, now, challengeExpiresAt, resetTokenExpiresAt]);

    const requestCode = async (normalizedEmail, isResend = false) => {
        setPending(true);
        setError('');
        try {
            const response = await publicPost(endpoints.request, { email: normalizedEmail });
            const data = response.data || {};
            if (!isResend) {
                if (typeof data.challengeId !== 'string' || !data.challengeId) throw new Error('The reset service returned an incomplete response. Please try again.');
                setEmail(normalizedEmail);
                setChallengeId(data.challengeId || '');
                setChallengeExpiresAt(Date.now() + Math.max(0, Number(data.expiresInSeconds) || 600) * 1000);
                setStep('verify');
                setOtp('');
            }
            setResendAt(Date.now() + Math.max(0, Number(data.resendAvailableInSeconds) || 60) * 1000);
        } catch (requestError) {
            if (requestError.status === 429 && requestError.retryAfterSeconds) setResendAt(Date.now() + requestError.retryAfterSeconds * 1000);
            setError(safeMessage(requestError, 'Could not request a reset code. Please try again.'));
        } finally {
            setPending(false);
        }
    };

    const handleRequest = (event) => {
        event.preventDefault();
        const normalizedEmail = emailInput.trim().toLowerCase();
        if (!normalizedEmail) return;
        requestCode(normalizedEmail);
    };

    const handleVerify = async (event) => {
        event.preventDefault();
        if (!challengeId || otp.length !== 6) {
            setError('Enter the six-digit code from your email.');
            return;
        }
        setPending(true);
        setError('');
        try {
            const response = await publicPost(endpoints.verify, { email, challengeId, otp });
            if (typeof response.data?.resetToken !== 'string' || !response.data.resetToken) throw new Error('The reset service did not return a valid reset session. Request a new code.');
            setResetToken(response.data.resetToken);
            setResetTokenExpiresAt(Date.now() + Math.max(0, Number(response.data?.expiresInSeconds) || 600) * 1000);
            setOtp('');
            setStep('password');
        } catch (verifyError) {
            if (verifyError.status === 429 && verifyError.retryAfterSeconds) setResendAt(Date.now() + verifyError.retryAfterSeconds * 1000);
            if (verifyError.status === 400) setError('That code is invalid or expired. Check it, or request a new code when resend is available.');
            else setError(safeMessage(verifyError, 'Could not verify the code. Please try again.'));
        } finally {
            setPending(false);
        }
    };

    const handleSetPassword = async (event) => {
        event.preventDefault();
        setError('');
        if (!validPasswordRules.every(Boolean)) {
            setError('Your password does not meet all the requirements below.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('The passwords do not match.');
            return;
        }
        if (!resetToken) {
            setStep('email');
            setChallengeId('');
            setOtp('');
            setError('Your reset session is unavailable. Request a new code to continue.');
            return;
        }
        setPending(true);
        try {
            await publicPost(endpoints.setPassword, { email, resetToken, newPassword, confirmPassword });
            setResetToken('');
            setResetTokenExpiresAt(0);
            setChallengeId('');
            setOtp('');
            setEmail('');
            setEmailInput('');
            setNewPassword('');
            setConfirmPassword('');
            useAuthStore.getState().logout();
            toast.success('Password reset successful. Log in with your new password.');
            navigate('/admin/login', { replace: true });
        } catch (resetError) {
            const message = resetError.message?.toLowerCase() || '';
            const unusableToken = resetError.status === 400 && /token|expired|used|consum|supersed/.test(message);
            if (unusableToken) {
                setResetToken('');
                setResetTokenExpiresAt(0);
                setChallengeId('');
                setOtp('');
                setStep('email');
                setError('Your reset session is no longer valid. Request a new code to continue.');
            } else {
                if (resetError.status === 429 && resetError.retryAfterSeconds) {
                    setResendAt(Date.now() + resetError.retryAfterSeconds * 1000);
                    setError(`Too many reset attempts. Wait ${resetError.retryAfterSeconds} seconds before trying again.`);
                } else {
                    setError(safeMessage(resetError, 'Could not reset the password. Please try again.'));
                }
            }
        } finally {
            setPending(false);
        }
    };

    const restart = () => {
        setStep('email');
        setEmail('');
        setEmailInput('');
        setChallengeId('');
        setOtp('');
        setResetToken('');
        setChallengeExpiresAt(0);
        setResetTokenExpiresAt(0);
        setResendAt(0);
        setError('');
    };

    const title = step === 'email' ? 'Forgot your password?' : step === 'verify' ? 'Check your email' : 'Create a new password';
    const description = step === 'email'
        ? "Enter the email address linked to your admin account and we'll send you a reset code."
        : step === 'verify'
            ? `Enter the six-digit reset code sent to ${email}.`
            : 'Choose a strong password for your Super Admin account.';

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50">
            <img src={bgImage1} alt="" aria-hidden="true" className="pointer-events-none absolute left-10 top-[-30px] -z-0" />
            <img src={bgImage2} alt="" aria-hidden="true" className="pointer-events-none absolute left-0 top-[-30px] -z-0" />
            <img src={bgImage3} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 -z-0 w-140" />
            <div className="z-10 mx-4 w-full max-w-md rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.20)] md:p-10">
                <div className="mb-6 flex flex-col items-center text-center">
                    <img src={logo} alt="GetYovo Logo" className="mb-6 h-12" />
                    <h1 className="mb-2 text-xl font-bold text-zinc-800">{title}</h1>
                    <p className="px-2 text-sm text-zinc-500">{description}</p>
                </div>

                {error && <div role="alert" className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</div>}

                {step === 'email' && <form onSubmit={handleRequest} className="space-y-5">
                    <label className="block space-y-2"><span className="block text-xs font-semibold text-zinc-800">Email</span><input type="email" required autoComplete="email" value={emailInput} onChange={(event) => setEmailInput(event.target.value.trim())} placeholder="e.g. johndoe@example.com" disabled={pending} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-50" /></label>
                    <button type="submit" disabled={pending || resendSeconds > 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002f1a] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#002414] disabled:cursor-not-allowed disabled:opacity-70">{pending ? <><Loader2 size={18} className="animate-spin"/>Sending code...</> : resendSeconds > 0 ? `Try again in ${resendSeconds}s` : 'Send Reset Code'}</button>
                </form>}

                {step === 'verify' && <form onSubmit={handleVerify} className="space-y-6">
                    <label className="block space-y-2"><span className="block text-xs font-semibold text-zinc-800">Six-digit code</span><input aria-label="Six-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} disabled={pending} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-zinc-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-50" /></label>
                    <button type="submit" disabled={pending || otp.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002f1a] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#002414] disabled:cursor-not-allowed disabled:opacity-70">{pending ? <><Loader2 size={18} className="animate-spin"/>Verifying...</> : 'Verify Code'}</button>
                    <div className="flex items-center justify-between text-xs"><button type="button" onClick={() => requestCode(email, true)} disabled={pending || resendSeconds > 0} className="font-bold text-emerald-700 underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline">{resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}</button><button type="button" onClick={restart} disabled={pending} className="font-semibold text-zinc-500 hover:text-zinc-800">Change email</button></div>
                </form>}

                {step === 'password' && <form onSubmit={handleSetPassword} className="space-y-4">
                    <label className="block space-y-2"><span className="block text-xs font-semibold text-zinc-800">New password</span><span className="relative block"><input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={pending} className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-50"/><button type="button" aria-label={showPassword ? 'Hide new password' : 'Show new password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-800">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
                    <ul className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500">{passwordRules.map(([label], index) => <li key={label} className={validPasswordRules[index] ? 'font-semibold text-emerald-700' : ''}>{validPasswordRules[index] ? '✓' : '•'} {label}</li>)}</ul>
                    <label className="block space-y-2"><span className="block text-xs font-semibold text-zinc-800">Confirm new password</span><span className="relative block"><input type={showConfirmation ? 'text' : 'password'} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={pending} className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 text-sm text-zinc-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 disabled:opacity-50"/><button type="button" aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'} onClick={() => setShowConfirmation((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-800">{showConfirmation ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
                    {confirmPassword && <p className={`text-[10px] font-medium ${newPassword === confirmPassword ? 'text-emerald-700' : 'text-rose-600'}`}>{newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}</p>}
                    <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002f1a] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#002414] disabled:cursor-not-allowed disabled:opacity-70">{pending ? <><Loader2 size={18} className="animate-spin"/>Resetting password...</> : 'Set New Password'}</button>
                </form>}

                <div className="-mx-8 -mb-8 mt-8 rounded-b-[24px] bg-zinc-100/50 py-5 text-center sm:-mx-10 sm:-mb-10">
                    <p className="text-[13px] font-medium text-zinc-500">{step === 'email' ? 'Remember your password? ' : 'Need to return to sign in? '}<Link to="/admin/login" className="font-bold text-[#00B074] hover:underline">Back to Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
