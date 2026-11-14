import { ArrowLeft, ArrowRight, CircleAlert, Clock3, Home, RotateCcw, ShieldAlert, ServerCrash, Wrench } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/images/GetYovo-Logo1.png';

const statusDetails = {
    403: {
        title: 'Access denied',
        description: "You don't have permission to view this page. Check that you're using the right account, or return to the homepage.",
        icon: ShieldAlert,
        action: 'Go to homepage',
        actionTo: '/',
    },
    404: {
        title: "We can't find that page",
        description: "The link may be incorrect, or the page may have moved. Let's get you back to where you need to be.",
        icon: CircleAlert,
        action: 'Go to homepage',
        actionTo: '/',
    },
    419: {
        title: 'Your session has expired',
        description: 'For your security, this session is no longer active. Sign in again to continue.',
        icon: Clock3,
        action: 'Go to admin login',
        actionTo: '/admin/login',
    },
    500: {
        title: 'Something went wrong',
        description: "We couldn't load this page. You can try again, or return to the homepage.",
        icon: ServerCrash,
        action: 'Try again',
        retry: true,
    },
    503: {
        title: 'GetYovo is taking a short break',
        description: 'This service is temporarily unavailable. Please try again in a little while.',
        icon: Wrench,
        action: 'Try again',
        retry: true,
    },
};

const StatusPage = ({ code: fixedCode }) => {
    const { code: routeCode } = useParams();
    const navigate = useNavigate();
    const code = Number(fixedCode || routeCode || 404);
    const page = statusDetails[code] || statusDetails[404];
    const Icon = page.icon;

    const handlePrimaryAction = () => {
        if (page.retry) {
            window.location.reload();
            return;
        }
        navigate(page.actionTo);
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7FAF8] px-5 py-12 text-zinc-900">
            <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[#00B074]/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -right-28 h-[30rem] w-[30rem] rounded-full bg-[#1C5E20]/10 blur-3xl" />

            <section className="relative w-full max-w-xl text-center">
                <Link to="/" aria-label="GetYovo home" className="mb-12 inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/70">
                    <img src={logo} alt="GetYovo" className="h-10 w-auto object-contain" />
                </Link>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00B074]/10 text-[#00885A] ring-1 ring-[#00B074]/15">
                    <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#00885A]">Error {code}</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{page.title}</h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-600">{page.description}</p>

                <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        onClick={handlePrimaryAction}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#00B074] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#00B074]/20 transition hover:bg-[#009965] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00B074]/25"
                    >
                        {page.retry ? <RotateCcw size={17} aria-hidden="true" /> : <Home size={17} aria-hidden="true" />}
                        {page.action}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-200"
                    >
                        <ArrowLeft size={17} aria-hidden="true" />
                        Go back
                    </button>
                </div>

                <Link to="/" className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-[#00885A]">
                    Return to GetYovo <ArrowRight size={15} aria-hidden="true" />
                </Link>
            </section>
        </main>
    );
};

export default StatusPage;
