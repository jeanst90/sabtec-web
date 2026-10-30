# Migração de Dados Legados

## Fonte
Planilhas Excel/CSV ou sistema antigo.

## Processo
1. Exportar clientes e aparelhos para CSV.
2. Script de importação (`scripts/import-csv.ts`) — a implementar.
3. Validar contagens e amostragem.
4. Cutover em janela de manutenção.

## Campos mínimos
- Cliente: nome, telefone, e-mail, CPF/CNPJ, endereço, cidade.
- Aparelho: tipo, marca, modelo, série, voltagem.