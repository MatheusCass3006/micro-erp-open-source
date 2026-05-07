import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from "typeorm";
import { getTenantId } from "../../shared/tenant/TenantContext";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<any>) {
    const tenantId = getTenantId();

    // Se existe um TenantContext ativo e não é PUBLIC
    // E a entidade tem suporte à coluna tenantId (ou permitimos injetar dinamicamente)
    if (tenantId && tenantId !== "PUBLIC") {
      // Injeta o tenantId automaticamente
      // NOTA: Para evitar poluir tabelas globais (ex: configuração geral de sistema),
      // poderia haver uma checagem se event.entity tem a propriedade tenantId.
      event.entity.tenantId = tenantId;
    }
  }

  // Nota: Implementar isolamento no 'beforeFind' em TypeORM requer um custom Repository,
  // pois o Subscriber de SELECT não permite alterar a query original facilmente.
  // Para fins desta Fase 1 sem quebrar arquitetura atual, focamos no isolamento de INSERT.
  // A filtragem lógica no SELECT deve ser adicionada aos Services ou a um BaseRepository.
}
