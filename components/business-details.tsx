import type { Business } from '@/lib/business';
export function BusinessDetails({ business: b }: { business: Business }) {
  const fields = [
    ['Business', b.registeredBusinessName], ['Address', b.businessAddress],
    ['Email', b.supportEmail], ['Telephone', b.supportPhone],
    ['Support hours', b.supportHours], ['Registration', b.businessRegistrationNumber],
  ].filter((field): field is [string, string] => Boolean(field[1]));
  if (!fields.length) return null;
  return <dl className="care-business">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === 'Email' ? <a href={'mailto:' + value}>{value}</a> : label === 'Telephone' ? <a href={'tel:' + value}>{value}</a> : value}</dd></div>)}</dl>;
}
