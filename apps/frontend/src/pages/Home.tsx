import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"

export default function Home() {
  const teamMembers = [
    {
      name: "Eduardo Rezende",
      role: "Full Stack Developer",
      bio: "Responsável pelo desenvolvimento do frontend e backend do ComicIF.",
      avatar: "/eduardo.jpg",
    },
    {
      name: "Vinicius Gabriel",
      role: "Prompt Engineer",
      bio: "Especialista em criação de prompts para geração de imagens com IA.",
      avatar: "/vinicius.svg",
    },
    {
      name: "Gustavo Teixeira",
      role: "QA Engineer",
      bio: "Garantia de qualidade e testes do sistema.",
      avatar: "/gustavo.png",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 pb-6">
      {/* Header */}
      <header className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
          ComicIF
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
          Gerador de Imagens com IA desenvolvido para o Evento Geek
        </p>
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="px-3 py-1 bg-primary/10 rounded-full">React</span>
          <span className="px-3 py-1 bg-primary/10 rounded-full">Node.js</span>
          <span className="px-3 py-1 bg-primary/10 rounded-full">Gemini AI</span>
        </div>
      </header>

      {/* Team Section */}
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">A Equipe</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Conheça as pessoas que tornaram este projeto possível
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary/20 group-hover:border-primary/50 transition-all"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/20 group-hover:border-primary/50 transition-all flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg sm:text-xl group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary/80">
                    {member.role}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Info */}
      <Card className="border-2 max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8 space-y-4 text-center">
          <h3 className="text-xl sm:text-2xl font-bold">Sobre o Projeto</h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            O ComicIF é uma plataforma que utiliza Inteligência Artificial para gerar imagens
            incríveis a partir de prompts de texto. Desenvolvido especialmente para o Evento Geek,
            o projeto combina tecnologias modernas como React, Node.js e Google Gemini AI para
            criar uma experiência única de geração de imagens.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-primary">∞</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Imagens Geradas</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Open Source</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-primary">2025</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Ano de Criação</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-primary">{teamMembers.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Desenvolvedores</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}