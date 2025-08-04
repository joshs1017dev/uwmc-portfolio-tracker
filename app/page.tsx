import Dashboard from '@/components/Dashboard';
import StockChart from '@/components/StockChart';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';

export default function Home() {
  return (
    <main>
      <Dashboard />
      <StockChart />
      <AdvancedAnalytics />
    </main>
  );
}