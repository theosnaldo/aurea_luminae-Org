import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, Plus, Trash, Minus, PlusCircle, AlertTriangle } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAdd: (item: any) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onDelete: (id: number) => void;
}

export default function InventoryView({ inventory, onAdd, onUpdateQuantity, onDelete }: InventoryViewProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState(0);
  const [unit, setUnit] = useState('');

  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, category, quantity, minQuantity, unit });
    setName('');
    setCategory('');
    setQuantity(0);
    setMinQuantity(0);
    setUnit('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Estoque e Insumos</h2>

      {lowStockItems.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-red-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Sugestão de Lista de Reposição
          </h3>
          <p className="text-xs text-red-200/80 mb-3">Os itens abaixo atingiram ou estão abaixo da quantidade mínima. Por favor, considere a compra destes insumos:</p>
          <ul className="text-xs text-red-200/80 list-disc list-inside space-y-1">
            {lowStockItems.map(item => (
              <li key={item.id}>{item.name} - Necessário repor para atingir o mínimo de {item.minQuantity}{item.unit}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#131519] border border-white/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Nome do Insumo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#1A1D23] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Categoria</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full bg-[#1A1D23] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Qtd</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required className="w-full bg-[#1A1D23] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Qtd Mínima</label>
            <input type="number" value={minQuantity} onChange={(e) => setMinQuantity(Number(e.target.value))} required className="w-full bg-[#1A1D23] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
        </div>
        <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Unidade</label>
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} required placeholder="ex: un, ml, g" className="w-full bg-[#1A1D23] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none" />
        </div>
        <button type="submit" className="bg-[#D4AF37] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs hover:bg-[#C5A030] transition"><Plus className="w-4 h-4" /> Adicionar</button>
      </form>

      <div className="bg-[#131519] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[#94A3B8] bg-[#1A1D23] uppercase">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Qtd Atual</th>
              <th className="px-6 py-4">Qtd Mínima</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {inventory.map((item) => (
              <tr key={item.id} className={item.quantity <= item.minQuantity ? 'bg-red-950/20' : ''}>
                <td className="px-6 py-4 font-semibold flex items-center gap-2">
                    {item.quantity <= item.minQuantity && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    {item.name}
                </td>
                <td className="px-6 py-4 text-[#94A3B8]">{item.category}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                  {item.quantity} {item.unit}
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-[#D4AF37]"><Minus className="w-3 h-3" /></button>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-[#D4AF37]"><PlusCircle className="w-3 h-3" /></button>
                </td>
                <td className="px-6 py-4">{item.minQuantity} {item.unit}</td>
                <td className="px-6 py-4"><button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-300"><Trash className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
