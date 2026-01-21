import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import wechatPaymentQR from "@/assets/wechat-payment-qr.jpg";

interface PaymentConfirmationProps {
  onConfirm: () => void;
  testName: string;
}

const PaymentConfirmation = ({ onConfirm, testName }: PaymentConfirmationProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22C55E] to-[#16A34A] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">推荐使用微信支付</h1>
        <p className="text-white/80 text-sm">支付后即可查看{testName}完整报告</p>
      </div>

      <Card className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
        <div className="flex flex-col items-center">
          <img 
            src={wechatPaymentQR} 
            alt="微信支付二维码" 
            className="w-64 h-64 object-contain mb-4 rounded-lg"
          />
          <p className="text-gray-500 text-sm mb-4">(= T ェ T=)(*璐)</p>
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-white">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M9.5 4c-1.14 0-2.27.24-3.31.71a9.998 9.998 0 0 0-4.47 4.47A9.93 9.93 0 0 0 1 12.5c0 1.14.24 2.27.71 3.31.47 1.04 1.15 1.97 2.02 2.76.87.79 1.88 1.42 2.98 1.87 1.1.45 2.27.68 3.47.69.1 0 .2 0 .3-.01a10 10 0 0 0 5.59-2.14c.96-.76 1.76-1.68 2.38-2.73.62-1.05 1.05-2.21 1.28-3.43.23-1.22.26-2.47.1-3.71-.16-1.24-.52-2.44-1.06-3.56-.55-1.12-1.27-2.13-2.15-2.99a9.99 9.99 0 0 0-3.02-2.14c-1.12-.54-2.33-.9-3.58-1.05A10.1 10.1 0 0 0 9.5 4z"/>
        </svg>
        <span className="text-lg font-semibold">微信支付</span>
      </div>

      <div className="mt-8 w-full max-w-sm space-y-3">
        <Button 
          onClick={onConfirm}
          className="w-full bg-white text-[#22C55E] hover:bg-gray-100 font-semibold py-6 rounded-xl text-lg"
        >
          我已完成支付，查看报告
        </Button>
        <p className="text-center text-white/60 text-xs">
          点击按钮即表示您已完成支付
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
