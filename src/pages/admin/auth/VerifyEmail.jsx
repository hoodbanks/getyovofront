import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/api';
import logo from '../../../assets/images/GetYovo-Logo2.png';
import bgImage from '../../../assets/images/login-background.png';
import { readSuperAdminVerificationEmail, rememberSuperAdminVerificationEmail } from './verifyEmailSession';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const verificationFailure = (error) => {
    const message = error?.message || '';
    if (error?.transportError || !error?.status) {
        return {
            kind: 'network',
            title: 'Network problem',
            message: message || 'Network error. Could not reach the server; please try again.',
        };
    }
    if (error.status === 429) {
        const details = [
            error.retryAfter ? `Retry-After ${error.retryAfter}` : '',
            error.rateLimitReset ? `RateLimit-Reset ${error.rateLimitReset}` : '',
        ].filter(Boolean);
        const wait = details.length ? ` ${details.join('; ')}.` : '';
        return {
            kind: 'rate-limit',
            title: 'Please wait',
            message: `${message || 'Too many requests. Please wait before trying again.'}${wait} You can retry after the wait.`,
        };
    }
    if (error.status === 404) {
        return {
            kind: 'unknown-email',
            title: 'Unknown email',
            message: message || 'No Super Admin account uses that email.',
        };
    }
    if (/already verified/i.test(message)) {
        return { kind: 'already-verified', title: 'Email already verified', message };
    }
    if (/expired/i.test(message)) {
        return { kind: 'expired', title: 'Code expired', message };
    }
    if (/invalid otp/i.test(message)) {
        return { kind: 'invalid', title: 'Invalid code', message };
    }
    if (/not found or already used/i.test(message)) {
        return { kind: 'unavailable', title: 'Code unavailable', message };
    }
    return {
        kind: 'error',
        title: 'Verification failed',
        message: message || 'The request could not be completed. Please try again.',
    };
};

const VerifyEmail = () => {
    const location = useLocation();
    const routedEmail = typeof location.state?.email === 'string' ? location.state.email.trim() : '';
    const [email, setEmail] = useState(routedEmail || readSuperAdminVerificationEmail());
    const [otp, setOtp] = useState('');
    const [formError, setFormError] = useState('');
    const [failure, setFailure] = useState(null);
    const [resendNotice, setResendNotice] = useState('');
    const [verifiedMessage, setVerifiedMessage] = useState('');

    useEffect(() => {
        rememberSuperAdminVerificationEmail(email);
    }, [email]);

    const verifyMutation = useMutation({
        mutationFn: async (body) => {
            const result = await api.post('/superadmin/auth/verify-otp', body);
            return { verified: true, message: result?.message || 'Email verified successfully! You can now log in.' };
        },
        retry: false,
        onSuccess: (result) => {
            setFailure(null);
            setFormError('');
            setOtp('');
            setVerifiedMessage(result.message);
        },
        onError: (error) => setFailure(verificationFailure(error)),
    });

    const resendMutation = useMutation({
        mutationFn: async (address) => {
            const result = await api.post('/superadmin/auth/resend-otp', { email: address });
            return { sent: true, message: result?.message || 'A new verification code has been sent.' };
        },
        retry: false,
        onSuccess: (result) => {
            setFailure(null);
            setResendNotice(result.message);
        },
        onError: (error) => {
            setResendNotice('');
            setFailure(verificationFailure(error));
        },
    });

    const pending = verifyMutation.isPending || resendMutation.isPending;

    const submitCode = (event) => {
        event.preventDefault();
        setFormError('');
        setFailure(null);
        const address = email.trim();
        if (!EMAIL_PATTERN.test(address) || address.length > 255) {
            setFormError('Enter a valid email address.');
            return;
        }
        if (!/^\d{6}$/.test(otp)) {
            setFormError('Enter the six-digit code, including any leading zeroes.');
            return;
        }
        verifyMutation.mutate({ email: address, otp });
    };

    const resendCode = () => {
        setFormError('');
        setFailure(null);
        setResendNotice('');
        const address = email.trim();
        if (!EMAIL_PATTERN.test(address) || address.length > 255) {
            setFormError('Enter a valid email address before requesting another code.');
            return;
        }
        resendMutation.mutate(address);
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50"
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat' }}
        >
            <div className="z-10 mx-4 w-full max-w-md rounded-[24px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.20)] md:p-10">
                <div className="mb-8 flex flex-col items-center">
                    <img src={logo} alt="GetYovo Logo" className="mb-6 h-12" />
                    <h1 className="text-xl font-bold text-zinc-800">Verify Super Admin email</h1>
                    <p className="mt-2 text-center text-xs leading-5 text-zinc-500">Enter the six-digit code sent to the new account. Verifying the email does not sign the account in.</p>
                </div>

                {verifiedMessage ? (
                    <div role="status" className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <h2 className="text-sm font-bold">Email verified</h2>
                        <p>{verifiedMessage}</p>
                        <Link to="/admin/login" className="inline-flex font-bold text-emerald-800 underline">Go to login</Link>
                    </div>
                ) : (
                    <form onSubmit={submitCode} className="space-y-5">
                        {failure && (
                            <div role="alert" data-verification-state={failure.kind} className="space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                                <h2 className="font-bold">{failure.title}</h2>
                                <p>{failure.message}</p>
                                {failure.kind === 'already-verified' && <Link to="/admin/login" className="inline-flex font-bold underline">Go to login</Link>}
                            </div>
                        )}
                        {formError && <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">{formError}</p>}
                        {resendNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">{resendNotice}</p>}

                        <label className="block space-y-2">
                            <span className="block text-xs font-semibold text-zinc-800">Email</span>
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => { setEmail(event.target.value); setFormError(''); }}
                                placeholder="name@example.com"
                                disabled={pending}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-[#00B074] focus:ring-2 focus:ring-[#00B074]/20 disabled:opacity-50"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="block text-xs font-semibold text-zinc-800">Six-digit code</span>
                            <input
                                aria-label="Six-digit code"
                                name="otp"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otp}
                                onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setFormError(''); }}
                                disabled={pending}
                                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-zinc-800 outline-none focus:border-[#00B074] focus:ring-2 focus:ring-[#00B074]/20 disabled:opacity-50"
                            />
                        </label>

                        <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#002f1a] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#002414] disabled:cursor-not-allowed disabled:opacity-70">
                            {verifyMutation.isPending ? <><Loader2 size={18} className="animate-spin" />Verifying...</> : 'Verify email'}
                        </button>
                        <button type="button" onClick={resendCode} disabled={pending} className="w-full text-xs font-bold text-emerald-700 underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline">
                            {resendMutation.isPending ? 'Sending code...' : 'Resend code'}
                        </button>
                    </form>
                )}

                <div className="mt-8 rounded-b-[24px] bg-zinc-100/50 py-5 text-center -mx-8 -mb-8 sm:-mx-10 sm:-mb-10">
                    <Link to="/admin/login" className="text-[13px] font-bold text-[#00B074] hover:underline">Back to login</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
