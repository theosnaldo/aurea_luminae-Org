import React, { useState } from 'react';
import { CashFlowTransaction } from '../types.ts';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, Calendar, Check, X, Search, DollarSign } from 'lucide-react';

interface CashFlowViewProps {
  cashFlow: CashFlowTransaction[];
  onAddTransaction: (data: any) => void;
}

export default function CashFlowView({ cashFlow, onAddTransaction }: CashFlowViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Sessão de Terapia');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(''); // float as string
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  const filteredTransactions = cashFlow.filter((tx) =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const totals = filteredTransactions.reduce(
    (acc, cur) => {
      if (cur.type === 'income') {
        acc.income += cur.amount;
      } else {
        acc.expense += cur.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const amountInCents = Math.round(parseFloat(amount) * 100);

    onAddTransaction({
      type,
      category,
      description,
      amount: amountInCents,
      date,
      paymentMethod,
    });

    // reset and close
    setType('income');
    setCategory('Sessão de Terapia');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Pix');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#D4AF37] tracking-tight font-serif italic">Fluxo de Caixa</h2>
          <p className="text-[#94A3B8] text-sm">Controle financeiro integrado. Lance entradas e despesas operacionais da clínica de forma transparente.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#D4AF37] hover:bg-[#C5A030] text-[#0f1115] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Lançar Movimentação
        </button>
      </div>

      {/* Financial totals cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
        <div className="bg-[#1A1D23] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium font-sans">Entradas Consolidadas</span>
            <p className="text-xl font-bold text-[#10B981] mt-1 font-mono">{formatCurrency(totals.income)}</p>
          </div>
          <div className="p-3 bg-emerald-950/40 text-[#10B981] border border-emerald-900/10 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1A1D23] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium">Saídas registradas</span>
            <p className="text-xl font-bold text-[#EF4444] mt-1 font-mono">{formatCurrency(totals.expense)}</p>
          </div>
          <div className="p-3 bg-rose-950/40 text-rose-400 border border-rose-900/10 rounded-xl">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`bg-[#1A1D23] p-5 rounded-2xl border flex items-center justify-between shadow-xs ${
          totals.income - totals.expense >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20'
        }`}>
          <div>
            <span className="text-xs text-[#94A3B8] font-semibold font-sans">Lucro Líquido Real</span>
            <p className={`text-xl font-bold mt-1 font-mono ${
              totals.income - totals.expense >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`}>
              {formatCurrency(totals.income - totals.expense)}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${
            totals.income - totals.expense >= 0 
              ? 'bg-emerald-950/40 text-[#10B981] border border-emerald-900/20' 
              : 'bg-rose-950/40 text-rose-450 border border-rose-900/20'
          }`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* List controls */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 text-[#94A3B8] w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar transações por descrição ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1A1D23] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37] transition placeholder-slate-650"
        />
      </div>

      {/* Ledger Book */}
      <div className="bg-[#1A1D23] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        <div className="bg-[#131519] px-6 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-[#F1F5F9] font-serif italic">Livro Caixa / Operações financeiras</h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8] text-xs font-sans">
            Nenhuma transação localizada no período. Registre uma nova movimentação acima.
          </div>
        ) : (
          <div className="overflow-x-auto text-sans">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 font-semibold uppercase tracking-wide">
                  <th className="p-4">Data</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono text-slate-400">
                      {tx.date.split('-').reverse().join('/')}
                    </td>
                    <td className="p-4 text-[#F1F5F9] font-medium">{tx.description}</td>
                    <td className="p-4">
                      <span className="bg-[#131519] border border-white/5 text-[#94A3B8] px-2.5 py-1 rounded-md text-[10px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${
                        tx.type === 'income' 
                          ? 'bg-emerald-950/40 text-[#10B981] border-emerald-900/20' 
                          : 'bg-rose-950/40 text-rose-450 border-rose-900/20'
                      }`}>
                        {tx.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{tx.paymentMethod || 'Pix'}</td>
                    <td className={`p-4 text-right font-mono font-bold text-xs ${tx.type === 'income' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-45 animate-fade-in font-sans">
          <div className="bg-[#1A1D23] rounded-2xl max-w-md w-full border border-white/10 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#131519] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-1.5 font-serif italic">
                <Wallet className="w-4 h-4 text-[#D4AF37]" />
                Lançar Nova Transação Financeira
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5 font-sans">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setCategory('Sessão de Terapia');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      type === 'income' 
                        ? 'border-[#10B981] bg-emerald-950/20 text-[#10B981]' 
                        : 'border-white/10 hover:bg-white/5 text-[#94A3B8]'
                    }`}
                  >
                    Entrada (Receita)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setCategory('Aluguel');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                      type === 'expense' 
                        ? 'border-[#EF4444] bg-rose-950/20 text-[#EF4444]' 
                        : 'border-white/10 hover:bg-white/5 text-[#94A3B8]'
                    }`}
                  >
                    Saída (Despesa)
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Categoria *</label>
                {type === 'income' ? (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                  >
                    <option value="Sessão de Terapia">Sessão de Terapia</option>
                    <option value="Consultoria Integrativa">Consultoria Integrativa</option>
                    <option value="Venda de Essências/Florais">Venda de Essências/Florais</option>
                    <option value="Curso/Workshop">Curso/Workshop</option>
                    <option value="Outros">Outras Receitas</option>
                  </select>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                  >
                    <option value="Aluguel">Aluguel / Condomínio</option>
                    <option value="Serviços Públicos">Luz / Água / Internet</option>
                    <option value="Inspeção & Materiais">Materiais e Agulhas de Acupuntura, Essências</option>
                    <option value="Pagamento Equipe">Salários / Honorários</option>
                    <option value="Marketing">Marketing / Divulgação</option>
                    <option value="Impostos">Encargos / Impostos</option>
                    <option value="Outros">Outras Despesas</option>
                  </select>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Descrição / Histórico detalhado *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all placeholder-slate-605"
                  placeholder="Ex: Aquisição de Cristais e Essência de Lavanda"
                  required
                />
              </div>

              {/* Amount & Date & paymentMethod */}
              <div className="grid grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#131519]/80 border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                    placeholder="Ex: 85.00"
                    min="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Data *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#131519]/80 border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1 font-sans">Método de Liquidação</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#131519] border border-white/10 focus:border-[#D4AF37] rounded-xl p-2.5 text-xs text-white focus:outline-none transition-all"
                >
                  <option value="Pix">Pix / Transferência Bancária</option>
                  <option value="Dinheiro">Dinheiro Físico</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                </select>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] bg-[#131519] rounded-xl border border-white/5 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#0F1115] bg-[#D4AF37] hover:bg-[#C5A030] rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
