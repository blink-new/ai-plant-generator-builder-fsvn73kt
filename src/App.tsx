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
  Loader2
} from 'lucide-react'

interface PlantPart {
  id: string
  type: 'trunk' | 'branch' | 'leaf' | 'flower' | 'root'
  color: string
  size: number
  position: { x: number; y: number }
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
        prompt: `Generate a detailed plant or tree based on this description: "${plantDescription}". Create a realistic plant with various parts like trunk, branches, leaves, flowers, and roots. Include colors, sizes, and positioning.`,
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
                      type: { type: 'string', enum: ['trunk', 'branch', 'leaf', 'flower', 'root'] },
                      color: { type: 'string' },
                      size: { type: 'number' },
                      position: {
                        type: 'object',
                        properties: {
                          x: { type: 'number' },
                          y: { type: 'number' }
                        }
                      }
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

  const addPlantPart = () => {
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
      position: { 
        x: Math.random() * 200 + 100, 
        y: Math.random() * 200 + 100 
      }
    }

    setCurrentPlant(prev => prev ? {
      ...prev,
      parts: [...prev.parts, newPart]
    } : null)
  }

  const simulateGrowth = () => {
    if (!currentPlant) return
    
    setCurrentPlant(prev => prev ? {
      ...prev,
      parts: prev.parts.map(part => ({
        ...part,
        size: Math.min(part.size * 1.2, 50)
      }))
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
        default: return <Sprout className="w-full h-full" style={{ color: part.color }} />
      }
    }

    return (
      <div
        key={part.id}
        className="absolute transition-all duration-300"
        style={{
          left: part.position.x,
          top: part.position.y,
          width: part.size,
          height: part.size
        }}
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
      <div className="flex h-[calc(100vh-80px)] gap-4 p-4">
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
            </div>
            <div className="relative w-full h-full bg-gradient-to-b from-blue-100 to-green-100">
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
                        <SelectItem value="trunk">Trunk</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="leaf">Leaf</SelectItem>
                        <SelectItem value="flower">Flower</SelectItem>
                        <SelectItem value="root">Root</SelectItem>
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

                  <Button onClick={addPlantPart} className="w-full">
                    <Palette className="w-4 h-4 mr-2" />
                    Add Part
                  </Button>
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

      {/* Bottom AI Generation */}
      <div className="p-4 bg-card border-t">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Textarea
              placeholder="Insert Plant Description!"
              value={plantDescription}
              onChange={(e) => setPlantDescription(e.target.value)}
              className="min-h-[80px] bg-primary/10 border-primary/20 text-foreground placeholder:text-muted-foreground"
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
              'Generate Plant'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App