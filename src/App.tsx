import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Textarea } from './components/ui/textarea'
import { Card } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Slider } from './components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { 
  Cloud, 
  AlertTriangle, 
  Settings, 
  Sprout, 
  Palette,
  TreePine,
  Leaf,
  Flower,
  Loader2,
  Grape,
  Cherry,
  Zap,
  Waves,
  Sparkles,
  Circle,
  Triangle,
  Square,
  Hexagon
} from 'lucide-react'

interface PlantPart {
  id: string
  type: 'trunk' | 'branch' | 'leaf' | 'flower' | 'root' | 'vine' | 'fruit' | 'seed' | 'thorn' | 'moss' | 'fungus' | 'bud' | 'stem' | 'bulb' | 'tendril'
  color: string
  size: number
  position: { x: number; y: number }
  growthRate?: 'slow' | 'normal' | 'fast' | 'rapid'
  special?: 'climbing' | 'spreading' | 'drooping' | 'upright' | 'spiral'
}

interface PlantData {
  id: string
  name: string
  description: string
  parts: PlantPart[]
  environment: {
    sunlight: number
    water: number
    temperature: number
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPlant, setCurrentPlant] = useState<PlantData | null>(null)
  const [plantDescription, setPlantDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPartType, setSelectedPartType] = useState<PlantPart['type']>('trunk')
  const [selectedColor, setSelectedColor] = useState('#22c55e')
  const [selectedGrowthRate, setSelectedGrowthRate] = useState<PlantPart['growthRate']>('normal')
  const [selectedSpecial, setSelectedSpecial] = useState<PlantPart['special']>('upright')
  const [isPlacementMode, setIsPlacementMode] = useState(false)
  const [environment, setEnvironment] = useState({
    sunlight: 50,
    water: 50,
    temperature: 50
  })

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const generatePlantWithAI = async () => {
    if (!plantDescription.trim()) return
    
    setIsGenerating(true)
    try {
      const { object } = await blink.ai.generateObject({
        prompt: `Generate a detailed plant or tree based on this description: "${plantDescription}". Create a realistic plant with various parts including: trunk, branches, leaves, flowers, roots, vines (for climbing plants), fruits, seeds, thorns, moss, fungus, buds, stems, bulbs, and tendrils. Consider growth rates (slow, normal, fast, rapid) and special behaviors (climbing, spreading, drooping, upright, spiral). Include appropriate colors, sizes, and positioning for each part.`,
        schema: {
          type: 'object',
          properties: {
            plant: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                parts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      type: { type: 'string', enum: ['trunk', 'branch', 'leaf', 'flower', 'root', 'vine', 'fruit', 'seed', 'thorn', 'moss', 'fungus', 'bud', 'stem', 'bulb', 'tendril'] },
                      color: { type: 'string' },
                      size: { type: 'number' },
                      position: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' }
                        }
                      },
                      growthRate: { type: 'string', enum: ['slow', 'normal', 'fast', 'rapid'] },
                      special: { type: 'string', enum: ['climbing', 'spreading', 'drooping', 'upright', 'spiral'] }
                    }
                  }
                }
              }
            }
          }
        }
      })

      const newPlant: PlantData = {
        id: Date.now().toString(),
        name: object.plant.name,
        description: object.plant.description,
        parts: object.plant.parts,
        environment
      }

      setCurrentPlant(newPlant)
    } catch (error) {
      console.error('Failed to generate plant:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const addPlantPart = (position?: { x: number; y: number }) => {
    if (!currentPlant) {
      // Create a new plant if none exists
      const newPlant: PlantData = {
        id: Date.now().toString(),
        name: 'Custom Plant',
        description: 'A manually built plant',
        parts: [],
        environment
      }
      setCurrentPlant(newPlant)
    }

    const newPart: PlantPart = {
      id: Date.now().toString(),
      type: selectedPartType,
      color: selectedColor,
      size: 20,
      position: position || { 
        x: Math.random() * 200 + 100, 
        y: Math.random() * 200 + 100 
      },
      growthRate: selectedGrowthRate,
      special: selectedSpecial
    }

    setCurrentPlant(prev => prev ? {
      ...prev,
      parts: [...prev.parts, newPart]
    } : null)
  }

  const handlePlantViewerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacementMode) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    addPlantPart({ x, y })
    setIsPlacementMode(false)
  }

  const enterPlacementMode = () => {
    setIsPlacementMode(true)
  }

  const cancelPlacementMode = () => {
    setIsPlacementMode(false)
  }

  const simulateGrowth = () => {
    if (!currentPlant) return
    
    setCurrentPlant(prev => prev ? {
      ...prev,
      parts: prev.parts.map(part => {
        let growthMultiplier = 1.2
        
        // Adjust growth based on growth rate
        switch (part.growthRate) {
          case 'slow':
            growthMultiplier = 1.1
            break
          case 'normal':
            growthMultiplier = 1.2
            break
          case 'fast':
            growthMultiplier = 1.4
            break
          case 'rapid':
            growthMultiplier = 1.8
            break
          default:
            growthMultiplier = 1.2
        }
        
        // Vines and tendrils grow differently
        if (part.type === 'vine' || part.type === 'tendril') {
          growthMultiplier *= 1.3
        }
        
        return {
          ...part,
          size: Math.min(part.size * growthMultiplier, 80)
        }
      })
    } : null)
  }

  const renderPlantPart = (part: PlantPart) => {
    const getIcon = () => {
      switch (part.type) {
        case 'trunk': return <TreePine className="w-full h-full" style={{ color: part.color }} />
        case 'branch': return <TreePine className="w-full h-full" style={{ color: part.color }} />
        case 'leaf': return <Leaf className="w-full h-full" style={{ color: part.color }} />
        case 'flower': return <Flower className="w-full h-full" style={{ color: part.color }} />
        case 'root': return <TreePine className="w-full h-full rotate-180" style={{ color: part.color }} />
        case 'vine': return <Waves className="w-full h-full" style={{ color: part.color }} />
        case 'fruit': return <Cherry className="w-full h-full" style={{ color: part.color }} />
        case 'seed': return <Circle className="w-full h-full" style={{ color: part.color }} />
        case 'thorn': return <Triangle className="w-full h-full" style={{ color: part.color }} />
        case 'moss': return <Sparkles className="w-full h-full" style={{ color: part.color }} />
        case 'fungus': return <Hexagon className="w-full h-full" style={{ color: part.color }} />
        case 'bud': return <Circle className="w-full h-full" style={{ color: part.color }} />
        case 'stem': return <TreePine className="w-full h-full rotate-45" style={{ color: part.color }} />
        case 'bulb': return <Square className="w-full h-full" style={{ color: part.color }} />
        case 'tendril': return <Waves className="w-full h-full rotate-45" style={{ color: part.color }} />
        default: return <Sprout className="w-full h-full" style={{ color: part.color }} />
      }
    }

    const getSpecialClasses = () => {
      let classes = "absolute transition-all duration-300"
      
      if (part.growthRate === 'fast' || part.growthRate === 'rapid') {
        classes += " animate-pulse"
      }
      
      if (part.special === 'climbing') {
        classes += " transform rotate-12"
      } else if (part.special === 'drooping') {
        classes += " transform rotate-180"
      } else if (part.special === 'spiral') {
        classes += " transform rotate-45"
      }
      
      return classes
    }

    return (
      <div
        key={part.id}
        className={getSpecialClasses()}
        style={{
          left: part.position.x,
          top: part.position.y,
          width: part.size,
          height: part.size
        }}
        title={`${part.type}${part.growthRate ? ` (${part.growthRate} growth)` : ''}${part.special ? ` - ${part.special}` : ''}`}
      >
        {getIcon()}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Plant Builder!</h1>
          <p className="text-muted-foreground mb-6">Please sign in to start building plants</p>
          <Button onClick={() => blink.auth.login()}>Sign In</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="p-4">
        <Badge className="bg-primary text-primary-foreground px-4 py-2 text-lg font-medium">
          Plant Builder!
        </Badge>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-200px)] gap-4 p-4">
        {/* Left Sidebar */}
        <div className="w-16 flex flex-col gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 bg-card hover:bg-accent"
            title="Environment Settings"
          >
            <Cloud className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 bg-card hover:bg-accent"
            title="Disaster Settings"
          >
            <AlertTriangle className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 bg-card hover:bg-accent"
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 bg-card hover:bg-accent"
            title="Simulate Growth"
            onClick={simulateGrowth}
          >
            <Sprout className="w-6 h-6" />
          </Button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex gap-4">
          {/* Plant Viewer */}
          <Card className="flex-1 bg-gray-100 relative overflow-hidden">
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Plant/Growth Viewer</h2>
              {currentPlant && (
                <p className="text-sm text-gray-600">{currentPlant.name}</p>
              )}
              {isPlacementMode && (
                <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-primary font-medium">
                      🎯 Click anywhere to place your {selectedPartType}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={cancelPlacementMode}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div 
              className={`relative w-full h-full bg-gradient-to-b from-blue-100 to-green-100 ${
                isPlacementMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
              onClick={handlePlantViewerClick}
            >
              {currentPlant ? (
                currentPlant.parts.map(renderPlantPart)
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No plant generated yet</p>
                    <p className="text-sm">Use AI generation or manual builder</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Manual Plant Builder */}
          <Card className="w-80 bg-gray-100">
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Manual Plant Builder</h2>
            </div>
            <div className="p-4 space-y-4">
              <Tabs defaultValue="parts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="parts">Parts</TabsTrigger>
                  <TabsTrigger value="environment">Environment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parts" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Part Type</label>
                    <Select value={selectedPartType} onValueChange={(value: PlantPart['type']) => setSelectedPartType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trunk">🌳 Trunk</SelectItem>
                        <SelectItem value="branch">🌿 Branch</SelectItem>
                        <SelectItem value="leaf">🍃 Leaf</SelectItem>
                        <SelectItem value="flower">🌸 Flower</SelectItem>
                        <SelectItem value="root">🌱 Root</SelectItem>
                        <SelectItem value="vine">🍇 Vine (Climbing)</SelectItem>
                        <SelectItem value="fruit">🍒 Fruit</SelectItem>
                        <SelectItem value="seed">🌰 Seed</SelectItem>
                        <SelectItem value="thorn">🌵 Thorn</SelectItem>
                        <SelectItem value="moss">✨ Moss</SelectItem>
                        <SelectItem value="fungus">🍄 Fungus</SelectItem>
                        <SelectItem value="bud">🌹 Bud</SelectItem>
                        <SelectItem value="stem">🌾 Stem</SelectItem>
                        <SelectItem value="bulb">🧅 Bulb</SelectItem>
                        <SelectItem value="tendril">🌿 Tendril</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#22c55e', '#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Growth Rate</label>
                    <Select value={selectedGrowthRate} onValueChange={(value: PlantPart['growthRate']) => setSelectedGrowthRate(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">🐌 Slow Growth</SelectItem>
                        <SelectItem value="normal">🌱 Normal Growth</SelectItem>
                        <SelectItem value="fast">⚡ Fast Growth</SelectItem>
                        <SelectItem value="rapid">🚀 Rapid Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Special Behavior</label>
                    <Select value={selectedSpecial} onValueChange={(value: PlantPart['special']) => setSelectedSpecial(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upright">⬆️ Upright</SelectItem>
                        <SelectItem value="climbing">🧗 Climbing</SelectItem>
                        <SelectItem value="spreading">↔️ Spreading</SelectItem>
                        <SelectItem value="drooping">⬇️ Drooping</SelectItem>
                        <SelectItem value="spiral">🌀 Spiral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Button onClick={enterPlacementMode} className="w-full" variant={isPlacementMode ? "default" : "outline"}>
                      <Palette className="w-4 h-4 mr-2" />
                      {isPlacementMode ? "Click to Place" : "Place with Mouse"}
                    </Button>
                    <Button onClick={() => addPlantPart()} className="w-full" variant="outline">
                      Add Random Position
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="environment" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sunlight: {environment.sunlight}%</label>
                    <Slider
                      value={[environment.sunlight]}
                      onValueChange={([value]) => setEnvironment(prev => ({ ...prev, sunlight: value }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Water: {environment.water}%</label>
                    <Slider
                      value={[environment.water]}
                      onValueChange={([value]) => setEnvironment(prev => ({ ...prev, water: value }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Temperature: {environment.temperature}%</label>
                    <Slider
                      value={[environment.temperature]}
                      onValueChange={([value]) => setEnvironment(prev => ({ ...prev, temperature: value }))}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Generation Section */}
      <div className="p-4 border-t bg-gradient-to-r from-primary/5 to-accent/5">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-800">AI Plant Generator</h3>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Describe your plant or tree
              </label>
              <Textarea
                placeholder="e.g., A tall oak tree with spreading branches and autumn leaves, or a climbing ivy vine with small flowers..."
                value={plantDescription}
                onChange={(e) => setPlantDescription(e.target.value)}
                className="min-h-[80px] bg-white border-primary/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button 
              onClick={generatePlantWithAI}
              disabled={isGenerating || !plantDescription.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Plant
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default App