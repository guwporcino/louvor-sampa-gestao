
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString || '';
  }
};

export const formatDatetime = (dateString: string): string => {
  try {
    if (!dateString) return '';
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return dateString || '';
  }
};

export const getBrazilianBanks = () => {
  return [
    { value: '001', label: 'Banco do Brasil' },
    { value: '104', label: 'Caixa Econômica Federal' },
    { value: '341', label: 'Itaú Unibanco' },
    { value: '033', label: 'Santander' },
    { value: '237', label: 'Bradesco' },
    { value: '745', label: 'Citibank' },
    { value: '422', label: 'Safra' },
    { value: '077', label: 'Inter' },
    { value: '318', label: 'BMG' },
    { value: '756', label: 'Sicoob' },
    { value: '748', label: 'Sicredi' },
    { value: '212', label: 'Banco Original' },
    { value: '655', label: 'Votorantim' },
    { value: '336', label: 'C6 Bank' },
    { value: '218', label: 'BS2' },
    { value: '707', label: 'Banco Daycoval' },
    { value: '260', label: 'Nubank' },
    { value: '290', label: 'Pagseguro' },
    { value: '380', label: 'PicPay' },
    { value: 'others', label: 'Outros' },
  ];
};

export const getAccountTypes = () => {
  return [
    { value: 'corrente', label: 'Conta Corrente' },
    { value: 'poupanca', label: 'Conta Poupança' },
    { value: 'salario', label: 'Conta Salário' },
    { value: 'investimento', label: 'Conta de Investimento' },
    { value: 'outros', label: 'Outros' },
  ];
};

export const formatCpfCnpj = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    // CPF
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ
    return numericValue
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};

export const removeMask = (value: string) => {
  return value.replace(/\D/g, '');
};
