import Game from "@/components/Game";
import JWTDetails from "@/components/JWTDetails";

const Index = () => {
  return (
    <main className="w-full h-screen bg-background overflow-hidden flex items-center justify-center p-8">
      <div className="relative w-full h-full max-w-6xl max-h-[75vh] bg-card rounded-lg border border-border shadow-2xl overflow-hidden">
        <JWTDetails />
        <Game />
      </div>
    </main>
  );
};

export default Index;