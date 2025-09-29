import ExternalServices from '@/components/dashboard/ExternalServices';
import LicenseGuard from '@/components/license/LicenseGuard';

export default function ExternalServicesPage() {
    return (
        <LicenseGuard
            featureName="external_services"
            showLicenseInfo={true}
            allowDemo={true}
        >
            <ExternalServices />
        </LicenseGuard>
    );
}
