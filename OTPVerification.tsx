import { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  loading: boolean;
}

export default function OTPVerification({ phoneNumber, onVerify, loading }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">אימות קוד</h2>
          <p className="text-gray-600">הזן את הקוד בן 6 הספרות ששלחנו אל</p>
          <p className="text-[#0038B8] font-semibold" dir="ltr">{phoneNumber}</p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0038B8] focus:border-transparent"
              />
            ))}
          </div>

          {loading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0038B8]"></div>
              <p className="mt-2 text-gray-600">מאמת קוד...</p>
            </div>
          )}

          <button
            onClick={() => setOtp(['', '', '', '', '', ''])}
            className="w-full text-[#0038B8] text-sm font-medium hover:underline"
          >
            לא קיבלת קוד? שלח שוב
          </button>
        </div>
      </div>
    </div>
  );
}
