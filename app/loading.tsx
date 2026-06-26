import GoldDoodleLoader from '@/app/components/GoldDoodleLoader';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
      <GoldDoodleLoader text="MENGUKIR..." />
    </div>
  );
}
