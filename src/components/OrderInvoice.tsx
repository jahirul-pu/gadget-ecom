"use client";

import React from 'react';
import { Order } from '@/store/useStore';

interface OrderInvoiceProps {
  order: Order;
}

export const OrderInvoice = ({ order }: OrderInvoiceProps) => {
  const invoiceId = parseInt(order.id.replace(/[^0-9a-f]/gi, '').substring(0, 8), 16).toString().slice(-5).padStart(5, '0');
  
  return (
    <div id={`invoice-${order.id}`} className="bg-white p-10 text-slate-900 font-sans max-w-[800px] mx-auto border border-slate-200 shadow-xl print:shadow-none print:border-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-blue-600 mb-2">TECHFLOW</h1>
          <p className="text-sm text-slate-500 font-medium">Modern Gadgets & Technology</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400 mb-1">Invoice</h2>
          <p className="font-bold text-slate-900">#{invoiceId}</p>
          <p className="text-sm text-slate-500">{order.date}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill To</h3>
          <div className="space-y-1">
            <p className="font-bold text-lg text-slate-900">{order.customer}</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {order.address}<br />
              {order.area}, {order.district}
            </p>
            <p className="text-sm font-bold text-slate-900 mt-2">{order.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Ship From</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-bold text-slate-900">TechFlow Bangladesh Ltd.</p>
            <p>Level 8, Banani Center</p>
            <p>Road 11, Block E, Banani</p>
            <p>Dhaka - 1213, Bangladesh</p>
            <p className="font-bold text-slate-900 mt-2">+880 1234 567890</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-100">
            <th className="py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Description</th>
            <th className="py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Price</th>
            <th className="py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Qty</th>
            <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {order.orderItems?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-4">
                <span className="font-bold text-slate-900 block">{item.name}</span>
                <span className="text-xs text-slate-500 capitalize">{typeof item.variant === 'string' ? item.variant : item.variant?.name || 'Default'}</span>
              </td>
              <td className="py-4 text-center text-slate-600 font-medium">৳{item.price.toLocaleString()}</td>
              <td className="py-4 text-center text-slate-600 font-medium">{item.quantity}</td>
              <td className="py-4 text-right font-bold text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
          {!order.orderItems && (
            <tr>
              <td className="py-4">
                <span className="font-bold text-slate-900 block">General Order Items</span>
                <span className="text-xs text-slate-500">Items Count: {order.items}</span>
              </td>
              <td className="py-4 text-center text-slate-600 font-medium">-</td>
              <td className="py-4 text-center text-slate-600 font-medium">{order.items}</td>
              <td className="py-4 text-right font-bold text-slate-900">৳{order.total.toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end border-t-2 border-slate-900 pt-8 mt-10">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-900">৳{order.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">Tax (0%)</span>
            <span className="font-bold text-slate-900">৳0</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-black uppercase tracking-widest text-slate-900">Total</span>
            <span className="text-2xl font-black text-blue-600 tracking-tighter">৳{order.total.toLocaleString()}</span>
          </div>
          <div className="pt-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Payment Method</p>
            <p className="text-sm font-bold text-slate-900">{order.payment}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="text-sm font-bold text-slate-900 mb-1">Thank you for shopping with TechFlow!</p>
        <p className="text-xs text-slate-500">Please contact support for any issues regarding this invoice.</p>
      </div>
    </div>
  );
};

const Separator = () => <div className="h-px bg-slate-100 my-2" />;
