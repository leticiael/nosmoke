"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "Bem-vindo ao NoSmoke!",
    description: "Um app para te ajudar a reduzir o cigarro de forma gamificada. Você ganha XP, completa missões e troca por recompensas reais!",
    image: "/images/guerreiro1.png",
    bgColor: "from-teal-950/60 to-slate-900/40",
  },
  {
    id: 2,
    title: "Sua Mesada de XP",
    description: "Todo dia à meia-noite você recebe 100 XP de mesada. Esse é seu 'dinheiro' para gastar em cigarros ou trocar por recompensas!",
    image: "/images/hearth.png",
    bgColor: "from-rose-950/60 to-slate-900/40",
    details: [
      { icon: "+", text: "100 XP por dia (mesada)", color: "text-teal-400" },
      { icon: "💰", text: "Acumula se não gastar", color: "text-amber-400" },
    ],
  },
  {
    id: 3,
    title: "Custo por Cigarro",
    description: "Para pedir um cigarro, você gasta XP. Dentro da meta é mais barato, fora da meta é mais caro!",
    image: "/images/cigarroaceso.png",
    bgColor: "from-amber-950/60 to-slate-900/40",
    details: [
      { icon: "✓", text: "Dentro da meta: 30 XP", color: "text-emerald-400" },
      { icon: "!", text: "Fora da meta: 50 XP", color: "text-red-400" },
    ],
  },
  {
    id: 4,
    title: "Punição por Excesso",
    description: "Se fumar mais de 3.5 cigarros no dia, você leva uma punição extra de -20 XP! Isso incentiva você a se controlar.",
    image: "/images/trophy.png",
    bgColor: "from-red-950/60 to-slate-900/40",
    details: [
      { icon: "⚠️", text: "Mais de 3.5 cigs = -20 XP", color: "text-red-400" },
      { icon: "🎯", text: "Fique dentro do limite!", color: "text-zinc-300" },
    ],
  },
  {
    id: 5,
    title: "Missões = XP Extra",
    description: "Complete missões diárias e semanais para ganhar XP bônus! Quanto mais você economiza, mais XP você ganha.",
    image: "/images/goldenbar.png",
    bgColor: "from-yellow-950/60 to-slate-900/40",
    details: [
      { icon: "📅", text: "Diárias: resetam à meia-noite", color: "text-zinc-300" },
      { icon: "📆", text: "Semanais: resetam segunda", color: "text-zinc-300" },
    ],
  },
  {
    id: 6,
    title: "Recompensas Reais",
    description: "Troque seu XP por recompensas de verdade! A Letícia vai aprovar e você recebe seu prêmio.",
    image: "/images/bau.png",
    bgColor: "from-purple-950/60 to-slate-900/40",
    details: [
      { icon: "🎟️", text: "Voucher iFood", color: "text-zinc-300" },
      { icon: "⚽", text: "Assistir esportes", color: "text-zinc-300" },
      { icon: "💆", text: "Massagem", color: "text-zinc-300" },
    ],
  },
  {
    id: 7,
    title: "Como Pedir Cigarro",
    description: "Clique em 'Pedir', escolha a quantidade e o motivo. A Letícia recebe o pedido e aprova (ou não 😅). O XP é descontado automaticamente.",
    image: "/images/girl.png",
    bgColor: "from-pink-950/60 to-slate-900/40",
    details: [
      { icon: "1.", text: "Escolha: ½ ou 1 cigarro", color: "text-zinc-300" },
      { icon: "2.", text: "Diga o motivo", color: "text-zinc-300" },
      { icon: "3.", text: "XP descontado + aguarda aprovação", color: "text-zinc-300" },
    ],
  },
  {
    id: 8,
    title: "Pronto para começar?",
    description: "Sua jornada começa agora! Lembre-se: cada cigarro a menos é mais XP pra trocar por recompensas. Você consegue! 💪",
    image: "/images/guerreiro1.png",
    bgColor: "from-teal-950/60 to-slate-900/40",
    isLast: true,
  },
];

export default function ComoFuncionaPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col pb-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Como Funciona</h1>
          <p className="text-sm text-zinc-500">{currentSlide + 1} de {slides.length}</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center mb-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? "w-6 bg-teal-500" 
                : "w-2 bg-zinc-700 hover:bg-zinc-600"
            }`}
          />
        ))}
      </div>

      {/* Slide Content */}
      <Card className={`flex-1 border-0 bg-gradient-to-br ${slide.bgColor}`}>
        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          {/* Image */}
          <div className="mb-6">
            <Image
              src={slide.image}
              alt={slide.title}
              width={100}
              height={100}
              className="[image-rendering:pixelated]"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-zinc-300 text-base mb-6 max-w-sm">
            {slide.description}
          </p>

          {/* Details */}
          {slide.details && (
            <div className="space-y-2 w-full max-w-xs">
              {slide.details.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-zinc-900/50 rounded-lg px-4 py-2"
                >
                  <span className="text-lg">{detail.icon}</span>
                  <span className={`text-sm ${detail.color}`}>{detail.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA on last slide */}
          {slide.isLast && (
            <Link href="/app" className="mt-6">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        <Button
          variant="outline"
          className="flex-1 border-zinc-700 hover:bg-zinc-800"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          className="flex-1 bg-teal-600 hover:bg-teal-700"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
