import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function CallPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { roomId } = useParams()
    const { activeChat } = useSelector((state) => state.chats)
    const { user } = useSelector((state) => state.auth)

    const callType =
        new URLSearchParams(location.search).get('type') === 'video'
            ? 'video'
            : 'audio'

    const otherUser = activeChat?.members?.find(
        (member) => member._id !== user?._id
    )
    const contactName =
        otherUser?.displayName || otherUser?.username || 'OpenGalexy contact'

    return (
        <div className="h-screen w-full overflow-hidden bg-slate-950 text-white">
            <div className="relative flex h-full flex-col bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.18),transparent_28%),linear-gradient(180deg,#04110d,#071a15_55%,#020617)]">
                <div className="flex items-center justify-between px-5 py-5 md:px-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 backdrop-blur"
                    >
                        ← Back
                    </button>
                    <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                            OpenGalexy Call
                        </p>
                        <p className="text-sm text-slate-300">Room {roomId}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                        {callType === 'video' ? 'Video' : 'Voice'}
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-4 text-center md:px-8">
                    <div className="grid gap-6">
                        <div className="mx-auto grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-sky-500 text-4xl font-extrabold shadow-2xl shadow-emerald-500/20 md:h-36 md:w-36">
                            {contactName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h1 className="font-['Space_Grotesk'] text-3xl font-bold md:text-5xl">
                                {contactName}
                            </h1>
                            <p className="mt-2 text-sm text-slate-300 md:text-base">
                                {callType === 'video'
                                    ? 'Video calling UI is ready for WebRTC integration.'
                                    : 'Voice calling UI is ready for WebRTC integration.'}
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-left backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                    Connection state
                                </p>
                                <p className="mt-3 text-lg font-semibold text-slate-100">
                                    Awaiting live media stream
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Signaling and auth stay intact. This screen
                                    now gives the route a production-style shell
                                    instead of a placeholder.
                                </p>
                            </div>

                            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-left backdrop-blur">
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                    Ready next
                                </p>
                                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                                    <li>Local and remote video tiles</li>
                                    <li>Mute, camera, and device switching</li>
                                    <li>
                                        Live duration, ringing, and reconnect
                                        states
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 px-5 pb-8 md:gap-5">
                    <button
                        type="button"
                        className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl text-slate-100 backdrop-blur"
                    >
                        🎤
                    </button>
                    <button
                        type="button"
                        className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl text-slate-100 backdrop-blur"
                    >
                        {callType === 'video' ? '📹' : '🔊'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="grid h-16 w-16 place-items-center rounded-3xl bg-red-500 text-2xl text-white shadow-xl shadow-red-500/30"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}
