import { StoreMotion } from '@/components/store-motion';
import './account.css';
export default function AccountLayout({ children }: { children: React.ReactNode }) { return <StoreMotion><div className="account-world">{children}</div></StoreMotion>; }
