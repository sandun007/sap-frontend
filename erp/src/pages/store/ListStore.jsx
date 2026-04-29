import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle
} from '@/components/ui/dialog'

import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import {
Plus,
Search,
Download,
Upload,
FileText,
MoreVertical,
Edit,
Trash2,
Store
} from 'lucide-react'

import axios from 'axios'

export default function ListStore(){

const [stores,setStores] = useState([])
const [searchTerm,setSearchTerm] = useState('')
const [loading,setLoading] = useState(true)

const [deleteDialog,setDeleteDialog] = useState({
open:false,
store:null
})

const [editDialog,setEditDialog] = useState({
open:false,
store:null
})

const [editForm,setEditForm] = useState({})
const [importDialog,setImportDialog] = useState(false)

const fileInputRef = useRef(null)

useEffect(()=>{
fetchStores()
},[])

const fetchStores = async()=>{
try{
setLoading(true)
const response = await axios.get('/stores')
setStores(response.data.data || [])
toast.success('Stores loaded')
}
catch(error){
toast.error('Failed to load stores')
}
finally{
setLoading(false)
}
}

function generateStoreCode(){
const timestamp=Date.now().toString().slice(-6)
const random=Math.random().toString(36).substr(2,4).toUpperCase()
return `STORE-${timestamp}-${random}`
}

const filteredStores = stores.filter(store =>
(store.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
(store.store_code || '').toLowerCase().includes(searchTerm.toLowerCase())
)

const handleAddStore=()=>{
window.location.href='/store/add'
}

const exportToExcel=()=>{
const worksheet = XLSX.utils.json_to_sheet(
filteredStores.map(s=>({
'Store Code':s.store_code,
'Store Name':s.store_name
}))
)

const workbook=XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook,worksheet,'Stores')
XLSX.writeFile(workbook,'stores.xlsx')

toast.success('Excel exported')
}

const exportToPDF=()=>{
const doc=new jsPDF()

doc.text('Store List Report',14,20)

autoTable(doc,{
head:[['Store Code','Store Name']],
body:filteredStores.map(s=>[
s.store_code,
s.store_name
]),
startY:30
})

doc.save('stores.pdf')

toast.success('PDF exported')
}

const handleFileUpload=(e)=>{
const file=e.target.files[0]
if(!file) return

const reader=new FileReader()

reader.onload=(event)=>{
try{
const data = new Uint8Array(event.target.result)
const workbook = XLSX.read(data,{type:'array'})
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
const jsonData = XLSX.utils.sheet_to_json(worksheet)

const newStores=jsonData.map(item=>({
store_code: generateStoreCode(),
store_name:item['Store Name'] || ''
}))

setStores(prev=>[...prev,...newStores])

toast.success(`${newStores.length} stores imported`)
setImportDialog(false)

}catch(error){
toast.error('Import failed')
}
}

reader.readAsArrayBuffer(file)
}

const downloadTemplate=()=>{
const data=[
{
'Store Code':'STORE-000001',
'Store Name':'Sample Store'
}
]

const ws=XLSX.utils.json_to_sheet(data)
const wb=XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb,ws,'Template')

XLSX.writeFile(wb,'store_template.xlsx')
}

const handleDelete = async (store) => {
  const id = store.id;   // ✅ correct field

  if (!id) {
    console.log("STORE OBJECT:", store);
    toast.error("Invalid store ID");
    return;
  }

  try {
    await axios.delete(`/stores/${id}`);
    toast.success("Store deleted");
    setDeleteDialog({ open: false, store: null });
    fetchStores();
  } catch (error) {
    console.log(error.response || error);
    toast.error("Delete failed");
  }
};

const openEditDialog=(store)=>{
setEditDialog({
open:true,
store
})
setEditForm(store)
}

const handleUpdate=async()=>{
try{
await axios.put(
`/stores/${editForm.id}`,
editForm
)

toast.success('Store updated')

setEditDialog({
open:false,
store:null
})

fetchStores()

}catch(error){
toast.error('Update failed')
}
}

return(
<div className="container mx-auto px-4 py-6 space-y-6">

<div className="flex justify-between items-center">
<div>
<CardTitle className="text-3xl">
Store List
</CardTitle>
<CardDescription>
Manage stores
</CardDescription>
</div>

<Button onClick={handleAddStore}>
<Plus className="mr-2 h-4 w-4"/>
Add Store
</Button>
</div>


<Card>
<CardContent className="pt-6">
<div className="flex gap-3 flex-wrap">

<div className="relative flex-1">
<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
placeholder="Search stores..."
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
className="pl-10"
/>
</div>

<Button variant="outline" onClick={exportToExcel}>
<Download className="mr-2 h-4 w-4"/>
Excel
</Button>

<Button variant="outline" onClick={exportToPDF}>
<FileText className="mr-2 h-4 w-4"/>
PDF
</Button>

<Button
variant="outline"
onClick={()=>setImportDialog(true)}
>
<Upload className="mr-2 h-4 w-4"/>
Import
</Button>

</div>
</CardContent>
</Card>


<Card>
<CardHeader>
<CardTitle>Stores</CardTitle>
<CardDescription>
{filteredStores.length} stores found
</CardDescription>
</CardHeader>

<CardContent>

<Table>

<TableHeader>
<TableRow>
<TableHead>Store Code</TableHead>
<TableHead>Store Name</TableHead>
<TableHead className="text-right">
Actions
</TableHead>
</TableRow>
</TableHeader>

<TableBody>

{filteredStores.map(store=>(
<TableRow key={store.store_id || store.id}>

<TableCell>
{store.store_code}
</TableCell>

<TableCell>
<div className="flex items-center gap-2">
<Store className="h-4 w-4 text-muted-foreground"/>
{store.store_name}
</div>
</TableCell>

<TableCell className="text-right">

<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="ghost" size="icon">
<MoreVertical className="h-4 w-4"/>
</Button>
</DropdownMenuTrigger>

<DropdownMenuContent align="end">

<DropdownMenuItem
onClick={()=>openEditDialog(store)}
>
<Edit className="mr-2 h-4 w-4"/>
Edit
</DropdownMenuItem>

<DropdownMenuItem
onClick={()=>
setDeleteDialog({
open:true,
store
})
}
className="text-destructive"
>
<Trash2 className="mr-2 h-4 w-4"/>
Delete
</DropdownMenuItem>

</DropdownMenuContent>
</DropdownMenu>

</TableCell>

</TableRow>
))}

</TableBody>
</Table>

</CardContent>
</Card>


{/* Delete Dialog */}
<Dialog
open={deleteDialog.open}
onOpenChange={()=>
setDeleteDialog({
open:false,
store:null
})
}
>
<DialogContent>
<DialogHeader>
<DialogTitle>Delete Store</DialogTitle>
<DialogDescription>
Delete {deleteDialog.store?.store_name} ?
</DialogDescription>
</DialogHeader>

<DialogFooter>
<Button
variant="outline"
onClick={()=>setDeleteDialog({
open:false,
store:null
})}
>
Cancel
</Button>

<Button
variant="destructive"
onClick={()=>
handleDelete(
deleteDialog.store?.store_id
)
}
>
Delete
</Button>

</DialogFooter>
</DialogContent>
</Dialog>


{/* Edit Dialog */}
<Dialog
open={editDialog.open}
onOpenChange={()=>
setEditDialog({
open:false,
store:null
})
}
>
<DialogContent>
<DialogHeader>
<DialogTitle>Edit Store</DialogTitle>
</DialogHeader>

<div className="space-y-4">

<div>
<Label>Store Code</Label>
<Input
value={editForm.store_code || ''}
onChange={(e)=>
setEditForm({
...editForm,
store_code:e.target.value
})
}
/>
</div>

<div>
<Label>Store Name</Label>
<Input
value={editForm.store_name || ''}
onChange={(e)=>
setEditForm({
...editForm,
store_name:e.target.value
})
}
/>
</div>

</div>

<DialogFooter>
<Button
variant="outline"
onClick={()=>setEditDialog({
open:false,
store:null
})}
>
Cancel
</Button>

<Button onClick={handleUpdate}>
Update
</Button>

</DialogFooter>

</DialogContent>
</Dialog>


{/* Import Dialog */}
<Dialog
open={importDialog}
onOpenChange={setImportDialog}
>
<DialogContent>

<DialogHeader>
<DialogTitle>Import Stores</DialogTitle>
</DialogHeader>

<div
className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
onClick={()=>fileInputRef.current?.click()}
>
<Upload className="mx-auto h-8 w-8 mb-2"/>
<p>Click to upload Excel</p>

<input
type="file"
ref={fileInputRef}
accept=".xlsx,.xls"
className="hidden"
onChange={handleFileUpload}
/>
</div>

<Button
variant="link"
onClick={downloadTemplate}
>
Download Template
</Button>

</DialogContent>
</Dialog>

</div>
)
}