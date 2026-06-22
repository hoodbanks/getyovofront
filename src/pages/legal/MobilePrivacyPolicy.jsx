import React, { useEffect } from 'react';

const MobilePrivacyPolicy = () => {
    useEffect(() => {
        window.location.replace('/mobile/privacy-policy.html');
    }, []);

    return (
        <div style={{ padding: '24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', textAlign: 'center', color: '#3f3f46' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Redirecting to Privacy Policy...</p>
            <p style={{ fontSize: '0.9rem', color: '#71717a' }}>
                If you are not automatically redirected, <a href="/mobile/privacy-policy.html" style={{ color: '#1C5E20', textDecoration: 'underline', fontWeight: 500 }}>click here</a>.
            </p>
        </div>
    );
};

export default MobilePrivacyPolicy;
