import { useSelector } from 'react-redux'
import UsernamePickerModal from '../components/Auth/UsernamePickerModal'

export default function OnboardingPage() {
    const { error } = useSelector((state) => state.auth)

    return (
        <div
            style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}
        >
            <UsernamePickerModal />

            {/* Error Toast */}
            {error && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        backgroundColor: 'var(--error-color)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    )
}
