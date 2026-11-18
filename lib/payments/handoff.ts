/** Submit only fields supplied by the authenticated server, to an exact PayHere endpoint. */
export function submitPayhere(payment:{endpoint:string;fields:Record<string,string>}) {
 if(!['https://sandbox.payhere.lk/pay/checkout','https://www.payhere.lk/pay/checkout'].includes(payment.endpoint))throw new Error('Invalid payment destination.');
 const form=document.createElement('form');form.method='POST';form.action=payment.endpoint;
 for(const [name,value]of Object.entries(payment.fields)){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.appendChild(input);}
 document.body.appendChild(form);form.submit();
}
