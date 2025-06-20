import { useForm } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import { FaMicrophone, FaPause } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessageAsync } from '../features/chat/ChatThunk';
import { currentMessage } from '../features/chat/ChatSelectors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Link } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';
import { clearMessage } from '../features/chat/ChatSlice';

const Chat = () => {
    const dispatch = useDispatch();
    const msg = useSelector(currentMessage);
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const [messages, setMessages] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [lastFinalTranscript, setLastFinalTranscript] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [lastSpokenMsg, setLastSpokenMsg] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);

    const messagesEndRef = useRef(null);

    const { finalTranscript, resetTranscript, browserSupportsSpeechRecognition } =
        useSpeechRecognition();
    const { speak, voices } = useSpeechSynthesis();

    const stopSpeaking = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    };

    useEffect(() => {
        // Stop speech on click anywhere
        const handleClick = () => {
            stopSpeaking();
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('beforeunload', stopSpeaking); // stop on refresh

        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('beforeunload', stopSpeaking);
            stopSpeaking();
        };
    }, []);

    const onSubmit = (data) => {
        stopSpeaking();
        if (isRecording) toggleRecording();
        const content = data.prompt.trim();
        if (!content) return;
        const userMessage = { role: 'user', content };
        const typingMessage = { role: 'assistant', content: 'Typing ...' };
        setMessages((prev) => [...prev, userMessage, typingMessage]);
        dispatch(sendChatMessageAsync({ prompt: content }));
        reset();
        resetTranscript();
        setLastFinalTranscript('');
    };

    const toggleRecording = () => {
        stopSpeaking();
        if (!browserSupportsSpeechRecognition) {
            alert('Speech recognition not supported.');
            return;
        }
        if (isRecording) {
            SpeechRecognition.stopListening();
            setIsRecording(false);
        } else {
            SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
            setIsRecording(true);
        }
    };

    useEffect(() => {
        const newTranscript = finalTranscript.replace(lastFinalTranscript, '').trim();
        if (newTranscript) {
            const currentInput = watch('prompt') || '';
            setValue('prompt', `${currentInput} ${newTranscript}`.trim());
            setLastFinalTranscript(finalTranscript);
        }
    }, [finalTranscript]);

    useEffect(() => {
        if (!msg || typeof msg !== 'string' || !msg.trim() || msg === lastSpokenMsg) return;

        setMessages((prev) => {
            const updated = [...prev];
            const typingIndex = updated.findLastIndex(
                (m) => m.role === 'assistant' && m.content === 'Typing ...'
            );
            if (typingIndex !== -1) {
                updated[typingIndex] = { role: 'assistant', content: msg };
            } else {
                updated.push({ role: 'assistant', content: msg });
            }
            return updated;
        });

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        if (!isMuted) {
            const voice =
                selectedVoice || voices.find((v) => v.lang.startsWith('en-IN')) || voices[0];
            if (voice) {
                stopSpeaking();
                speak({ text: msg, voice, rate, pitch });
                setLastSpokenMsg(msg);
            }
        }
        dispatch(clearMessage());
    }, [msg, voices, selectedVoice, rate, speak, pitch, isMuted, lastSpokenMsg]);

    const copyToClipboard = (code, index) => {
        navigator.clipboard.writeText(code);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const renderMessage = (text) => {
        const parts = text.split(/```(?:[a-zA-Z]*)?\n?/g);
        return parts.map((part, i) => {
            if (i % 2 === 0) {
                return part.trim() ? (
                    <p key={i} className="whitespace-pre-wrap mb-2">
                        {part}
                    </p>
                ) : null;
            } else {
                return (
                    <div key={i} className="relative">
                        <button
                            onClick={() => copyToClipboard(parts[i], i)}
                            className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                        >
                            {copiedIndex === i ? 'Copied!' : 'Copy'}
                        </button>
                        <SyntaxHighlighter
                            language="javascript"
                            style={oneDark}
                            customStyle={{ borderRadius: '0.75rem', padding: '1rem' }}
                        >
                            {parts[i]}
                        </SyntaxHighlighter>
                    </div>
                );
            }
        });
    };

    return (
        <div className="pt-16 fixed inset-0 bg-[#0f172a] text-white flex flex-col md:flex-row gap-4 px-4">
            <aside className="hidden md:flex flex-col w-1/4 bg-[#0f1d2a] rounded-xl p-6 shadow-xl">
                <div className="bg-white text-black font-bold w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
                    VA
                </div>
                <h2 className="text-center font-semibold text-lg">You are talking to a ChatBOT</h2>
                <p className="text-sm text-center mt-4 text-gray-300">
                    Ask about Knowledge, Business, Education, etc. Avoid personal info.
                </p>

                <div className="mt-6 flex flex-col gap-2 text-sm">
                    <button
                        onClick={() => setIsMuted((prev) => !prev)}
                        className={`w-full ${isMuted ? 'bg-yellow-500' : 'bg-green-600'} hover:opacity-90 text-white font-semibold py-2 rounded-lg`}
                    >
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>

                    <select
                        onChange={(e) =>
                            setSelectedVoice(voices.find((v) => v.name === e.target.value))
                        }
                        className="bg-gray-800 text-white px-2 py-2 rounded-lg"
                    >
                        <option value="">Select Voice</option>
                        {voices.map((v, i) => (
                            <option key={i} value={v.name}>
                                {v.name} ({v.lang})
                            </option>
                        ))}
                    </select>

                    <label>Rate: {rate.toFixed(1)}</label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(+e.target.value)}
                        className="w-full"
                    />

                    <label>Pitch: {pitch.toFixed(1)}</label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(+e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <Link
                        to="/chat/history"
                        className="text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
                    >
                        See History
                    </Link>
                    <button
                        onClick={() => setMessages([])}
                        className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 rounded-lg"
                    >
                        Clear Conversation
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-[#1e293b] rounded-xl shadow-xl overflow-hidden">
                <div className="text-xl font-semibold text-center py-4 border-b border-gray-700">
                    Model - CHAT 1.0 Bot
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`max-w-[80%] px-5 py-3 rounded-xl text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white self-end ml-auto'
                                : 'bg-gray-700 text-gray-100 self-start mr-auto'
                                }`}
                        >
                            {renderMessage(msg.content)}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex items-center bg-[#0f1d2a] px-4 py-3 border-t border-gray-700"
                >
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`text-white text-xl mr-3 ${isRecording ? 'text-red-500' : 'hover:text-blue-400'}`}
                        title={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        {isRecording ? <FaPause /> : <FaMicrophone />}
                    </button>

                    <input
                        {...register('prompt')}
                        type="text"
                        placeholder="Send a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-base px-2"
                    />

                    <button type="submit" className="text-white text-2xl ml-3 hover:text-blue-400">
                        <IoMdSend />
                    </button>
                </form>
            </main>
        </div>
    );
};

export default Chat;
