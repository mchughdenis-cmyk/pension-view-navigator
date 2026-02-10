import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Star,
  FileSpreadsheet,
  Download,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

interface InvestmentProduct {
  id: string
  name: string
  isin: string
  sedol: string
  type: 'fund' | 'etf' | 'bond' | 'cash' | 'pension' | 'isa' | 'gia'
  wrapper: 'pension' | 'isa' | 'gia' | 'all'
  provider: string
  sector: string
  riskLevel: number
  ongoingCharge: number
  performance1Y: number
  performance3Y: number
  performance5Y: number
  morningstarRating: number
  status: 'active' | 'suspended' | 'closed'
  minInvestment: number
  currency: string
}

export default function InvestmentProducts() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const products: InvestmentProduct[] = [
    {
      id: '1',
      name: 'Vanguard LifeStrategy 80% Equity',
      isin: 'GB00B4PQW151',
      sedol: 'B4PQW15',
      type: 'fund',
      wrapper: 'all',
      provider: 'Vanguard',
      sector: 'Mixed Investment 40-85% Shares',
      riskLevel: 5,
      ongoingCharge: 0.22,
      performance1Y: 8.5,
      performance3Y: 24.3,
      performance5Y: 42.1,
      morningstarRating: 4,
      status: 'active',
      minInvestment: 500,
      currency: 'GBP'
    },
    {
      id: '2',
      name: 'Legal & General Global Tech Index',
      isin: 'GB00BG0QPL70',
      sedol: 'BG0QPL7',
      type: 'fund',
      wrapper: 'isa',
      provider: 'Legal & General',
      sector: 'Technology & Technology Innovation',
      riskLevel: 6,
      ongoingCharge: 0.32,
      performance1Y: 15.2,
      performance3Y: 45.8,
      performance5Y: 89.3,
      morningstarRating: 5,
      status: 'active',
      minInvestment: 100,
      currency: 'GBP'
    },
    {
      id: '3',
      name: 'BlackRock Corporate Bond Fund',
      isin: 'GB0002426810',
      sedol: '0242681',
      type: 'bond',
      wrapper: 'pension',
      provider: 'BlackRock',
      sector: 'Sterling Corporate Bond',
      riskLevel: 3,
      ongoingCharge: 0.44,
      performance1Y: 2.1,
      performance3Y: 5.4,
      performance5Y: 12.8,
      morningstarRating: 3,
      status: 'active',
      minInvestment: 1000,
      currency: 'GBP'
    },
    {
      id: '4',
      name: 'HSBC FTSE All-World Index',
      isin: 'GB00BMJJJF91',
      sedol: 'BMJJJF9',
      type: 'fund',
      wrapper: 'all',
      provider: 'HSBC',
      sector: 'Global',
      riskLevel: 5,
      ongoingCharge: 0.13,
      performance1Y: 10.2,
      performance3Y: 28.5,
      performance5Y: 52.1,
      morningstarRating: 4,
      status: 'active',
      minInvestment: 100,
      currency: 'GBP'
    },
    {
      id: '5',
      name: 'Scottish Widows Cash Fund',
      isin: 'GB00B8C3GD78',
      sedol: 'B8C3GD7',
      type: 'cash',
      wrapper: 'gia',
      provider: 'Scottish Widows',
      sector: 'Money Market',
      riskLevel: 1,
      ongoingCharge: 0.10,
      performance1Y: 4.8,
      performance3Y: 8.2,
      performance5Y: 10.5,
      morningstarRating: 3,
      status: 'active',
      minInvestment: 0,
      currency: 'GBP'
    }
  ]

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.isin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sedol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || p.type === filterType
    return matchesSearch && matchesType
  })

  const getRiskColor = (level: number) => {
    if (level <= 2) return 'bg-green-500/20 text-green-400'
    if (level <= 4) return 'bg-yellow-500/20 text-yellow-400'
    if (level <= 5) return 'bg-orange-500/20 text-orange-400'
    return 'bg-red-500/20 text-red-400'
  }

  const formatPerformance = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast({
        title: "File Uploaded",
        description: `Processing ${file.name}...`,
      })
      setTimeout(() => {
        toast({
          title: "Import Complete",
          description: "15 products imported successfully, 2 updated",
        })
        setIsUploadDialogOpen(false)
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Investment Products</h2>
          <p className="text-muted-foreground">Manage available funds, ETFs, and investment options</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Products</DialogTitle>
                <DialogDescription>
                  Upload a CSV or Excel file containing investment products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                  />
                  <Label htmlFor="file-upload">
                    <Button asChild variant="outline">
                      <span>Choose File</span>
                    </Button>
                  </Label>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Required columns:</p>
                  <p>ISIN, SEDOL, Name, Type, Provider, Sector, Risk Level, OCF</p>
                </div>
                <Button variant="link" className="p-0 h-auto">
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Investment Product</DialogTitle>
                <DialogDescription>
                  Enter the details of the new investment product
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="Enter fund name" />
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input placeholder="e.g., Vanguard" />
                </div>
                <div className="space-y-2">
                  <Label>ISIN</Label>
                  <Input placeholder="GB00B4PQW151" />
                </div>
                <div className="space-y-2">
                  <Label>SEDOL</Label>
                  <Input placeholder="B4PQW15" />
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fund">Fund</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="pension">Pension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Wrapper</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wrapper" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wrappers</SelectItem>
                      <SelectItem value="pension">Pension (SIPP)</SelectItem>
                      <SelectItem value="isa">Stocks & Shares ISA</SelectItem>
                      <SelectItem value="gia">General Investment Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Input placeholder="e.g., Global Equity" />
                </div>
                <div className="space-y-2">
                  <Label>Risk Level (1-7)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {level} - {level <= 2 ? 'Low' : level <= 4 ? 'Medium' : level <= 5 ? 'Medium-High' : 'High'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ongoing Charge (%)</Label>
                  <Input type="number" step="0.01" placeholder="0.22" />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Investment (£)</Label>
                  <Input type="number" placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="GBP">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description of the investment product" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({ title: "Product Added", description: "New investment product has been created" })
                  setIsAddDialogOpen(false)
                }}>
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.morningstarRating >= 4).length}</p>
                <p className="text-sm text-muted-foreground">4+ Star Rated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{products.filter(p => p.status !== 'active').length}</p>
                <p className="text-sm text-muted-foreground">Suspended/Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ISIN, or SEDOL..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fund">Funds</SelectItem>
                <SelectItem value="etf">ETFs</SelectItem>
                <SelectItem value="bond">Bonds</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="pension">Pension</SelectItem>
                <SelectItem value="isa">ISA Only</SelectItem>
                <SelectItem value="gia">GIA Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">ISIN/SEDOL</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Risk</TableHead>
                  <TableHead className="hidden md:table-cell">OCF</TableHead>
                  <TableHead className="text-right">1Y</TableHead>
                  <TableHead className="hidden md:table-cell text-right">3Y</TableHead>
                  <TableHead className="hidden lg:table-cell">Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.provider}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-xs">
                        <p>{product.isin}</p>
                        <p className="text-muted-foreground">{product.sedol}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">{product.type}</Badge>
                        <Badge variant="outline" className="text-[10px]">{product.wrapper === 'all' ? 'All' : product.wrapper.toUpperCase()}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={getRiskColor(product.riskLevel)}>
                        {product.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.ongoingCharge.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPerformance(product.performance1Y)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {formatPerformance(product.performance3Y)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < product.morningstarRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
