import type { Business } from '@/lib/business';
import { isConfirmed } from '@/lib/business';
export function BusinessDetails({ business: b }: { business: Business }) {
  return <dl className="care-business"><div><dt>Business</dt><dd>{b.registeredBusinessName}</dd></div>
    <div><dt>Address</dt><dd>{b.businessAddress}</dd></div>
    <div><dt>Email</dt><dd>{isConfirmed(b.supportEmail) ? <a href={'mailto:' + b.supportEmail}>{b.supportEmail}</a> : b.supportEmail}</dd></div>
    <div><dt>Telephone</dt><dd>{isConfirmed(b.supportPhone) ? <a href={'tel:' + b.supportPhone}>{b.supportPhone}</a> : b.supportPhone}</dd></div>
    <div><dt>Support hours</dt><dd>{b.supportHours}</dd></div>
    {b.businessRegistrationNumber && <div><dt>Registration</dt><dd>{b.businessRegistrationNumber}</dd></div>}</dl>;
}
