import { DomainRepository } from '@/db/repository';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { SearchWorkspace } from '@/components/search/SearchWorkspace';

export const instant = false;

export default function SearchPage() {
  const profiles = DomainRepository.getProfiles();
  const countries = DomainRepository.getCountries();
  const usStates = DomainRepository.getUSStates();
  const professions = DomainRepository.getProfessions();
  const educationLevels = DomainRepository.getEducationLevels();
  const sectsAndMazhabs = DomainRepository.getSectsAndMazhabs();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <AppHeader />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: 'var(--space-xl) var(--space-md)', width: '100%', flex: 1 }}>
        <SearchWorkspace
          initialProfiles={profiles}
          countries={countries}
          usStates={usStates}
          professions={professions}
          educationLevels={educationLevels}
          sectsAndMazhabs={sectsAndMazhabs}
        />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
