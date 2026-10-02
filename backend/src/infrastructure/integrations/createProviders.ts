import { IntegrationProviders } from '../../domain/integrations/IntegrationPorts';
import { InstagramProvider } from './InstagramProvider';
import { PriceReportProvider } from './PriceReportProvider';
import { BasalamProvider } from './BasalamProvider';
import { NotificationProvider } from './NotificationProvider';

export function createIntegrationProviders(): IntegrationProviders {
  return { instagram: new InstagramProvider(), prices: new PriceReportProvider(), basalam: new BasalamProvider(), notifications: new NotificationProvider() };
}
