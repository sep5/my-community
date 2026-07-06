import Header from './Header';
import Footer from './Footer';

/**
 * 메인 레이아웃 — Header + main + Footer
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
