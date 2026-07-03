export default function Footer() {
  return (
    <footer className="border-t border-slate-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>© {new Date().getFullYear()} Estate. Все права защищены.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-royal">О нас</a>
          <a href="#" className="hover:text-royal">Контакты</a>
          <a href="#" className="hover:text-royal">Помощь</a>
        </div>
      </div>
    </footer>
  );
}
