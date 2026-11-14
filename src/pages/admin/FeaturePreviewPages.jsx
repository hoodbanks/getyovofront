import { ArrowUpRight, Gift, Megaphone } from 'lucide-react';

const previewContent = {
    referrals: {
        title: 'Referral Activities',
        description: 'A workspace for tracking who referred new users and how referral rewards progress.',
        icon: Gift,
        sections: [
            { title: 'Referral overview', description: 'Referral totals and reward summaries will appear here.' },
            { title: 'Referral activity', description: 'Invitations, sign-ups, and completed referral milestones will be listed here.' },
            { title: 'Reward tracking', description: 'Reward eligibility and fulfilment status will be available here.' },
        ],
    },
    promotions: {
        title: 'Promotions',
        description: 'A workspace for preparing promotional campaigns, offers, and discount codes.',
        icon: Megaphone,
        sections: [
            { title: 'Campaign overview', description: 'Campaign status and performance summaries will appear here.' },
            { title: 'Promotional offers', description: 'Offer details, eligibility, and discount rules will be managed here.' },
            { title: 'Campaign schedule', description: 'Promotion start and end dates will be shown here.' },
        ],
    },
};

const FeaturePreview = ({ feature }) => {
    const Icon = feature.icon;

    return (
        <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
            <section className="relative overflow-hidden rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[#00B074]/10 blur-3xl" aria-hidden="true" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00B074]/10 text-[#00885A]">
                        <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00885A]">Feature preview</p>
                        <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">{feature.title}</h1>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{feature.description}</p>
                    </div>
                    <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 sm:ml-auto">Backend not connected</span>
                </div>
            </section>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={`${feature.title} preview sections`}>
                {feature.sections.map((section) => (
                    <article key={section.title} className="min-h-48 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500">
                                <Icon size={19} aria-hidden="true" />
                            </div>
                            <ArrowUpRight size={17} className="text-zinc-300" aria-hidden="true" />
                        </div>
                        <h2 className="mt-6 text-base font-semibold text-zinc-900">{section.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">{section.description}</p>
                    </article>
                ))}
            </section>
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-5 py-4 text-sm leading-6 text-zinc-500">
                This screen is a static frontend preview. It does not load or change real account, referral, or campaign data.
            </p>
        </div>
    );
};

export const ReferralActivitiesPage = () => <FeaturePreview feature={previewContent.referrals} />;
export const PromotionsPage = () => <FeaturePreview feature={previewContent.promotions} />;
