import ProfileCard from '../components/Profile/ProfileCard'
import TempControlPanel from '../components/Profile/TempControlPanel'
import PrivacySettings from '../components/Profile/PrivacySettings'
import SettingsPanel from '../components/Profile/SettingsPanel'

export default function ProfilePage() {
    return (
        <div
            className="w-full h-full overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            <div className="max-w-lg mx-auto px-4 pb-8">
                {/* Profile Card */}
                <div
                    className="rounded-2xl overflow-hidden mb-4 mt-4"
                    style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <ProfileCard />
                </div>

                {/* Temp Controls */}
                <div className="mb-4">
                    <TempControlPanel />
                </div>

                {/* Privacy */}
                <div className="mb-4">
                    <PrivacySettings />
                </div>

                {/* Settings */}
                <div className="mb-4">
                    <SettingsPanel />
                </div>
            </div>
        </div>
    )
}
