import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Settings,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { COMPANY } from "@/lib/company";

export default function SettingsPage() {
  const company = [
    { icon: Building2, label: "Nome", value: COMPANY.name },
    { icon: ShieldCheck, label: "CNPJ", value: COMPANY.cnpj },
    { icon: MapPin, label: "Endereço", value: COMPANY.address },
    { icon: Phone, label: "Telefone", value: COMPANY.phone },
    { icon: Mail, label: "E-mail", value: COMPANY.email },
    { icon: Globe, label: "Site", value: COMPANY.site },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurações"
        description="Dados da empresa e preferências do sistema"
        icon={Settings}
      />

      <div className="sabtec-card p-4 sm:p-5">
        <h2 className="mb-3 font-display text-base font-bold">Empresa</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {company.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon size={15} />
                </span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="truncate text-sm">{item.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>
        <p className="mt-4 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          A edição dos dados da empresa, textos padrão do termo e usuários estará
          disponível em breve.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sabtec-card p-4">
          <h2 className="font-display text-base font-bold">Termo de garantia</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Duração padrão: 90 dias. Textos de condições e exclusões personalizáveis
            na emissão de cada termo.
          </p>
        </div>
        <div className="sabtec-card p-4">
          <h2 className="font-display text-base font-bold">Notificações</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Alertas de garantias vencendo e orçamentos pendentes no dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
