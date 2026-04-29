import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

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
Building2
} from 'lucide-react'

import axios from 'axios'

export default function ListBank(){

const [banks,setBanks] = useState([])
const [searchTerm,setSearchTerm] = useState('')
const [loading,setLoading] = useState(true)

const [deleteDialog,setDeleteDialog] = useState({
open:false,
bank:null
})

const [editDialog,setEditDialog] = useState({
open:false,
bank:null
})

const [editForm,setEditForm] = useState({})
const [importDialog,setImportDialog] = useState(false)

const fileInputRef = useRef(null)

useEffect(()=>{
fetchBanks()
},[])


const fetchBanks = async()=>{
try{
setLoading(true)

const response = await axios.get('/banks')

setBanks(response.data.data || [])

toast.success('Banks loaded')

}catch(error){
toast.error('Failed to load banks')
}
finally{
setLoading(false)
}
}


function generateBankCode(){
const timestamp = Date.now().toString().slice(-6)
const random = Math.random().toString(36).substr(2,4).toUpperCase()

return `BANK-${timestamp}-${random}`
}


const filteredBanks = banks.filter(bank =>
(bank.bank_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
(bank.bank_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
(bank.branch_name || '').toLowerCase().includes(searchTerm.toLowerCase())
)


const handleAddBank=()=>{
window.location.href='/bank/add'
}


const exportToExcel=()=>{

const worksheet = XLSX.utils.json_to_sheet(
filteredBanks.map(b=>({
'Bank Code':b.bank_code,
'Bank Name':b.bank_name,
'Branch':b.branch_name,
'Account Number':b.account_number,
'Account Holder':b.account_holder_name
}))
)

const workbook = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
workbook,
worksheet,
'Banks'
)

XLSX.writeFile(
workbook,
'banks.xlsx'
)

toast.success('Excel exported')
}



const exportToPDF=()=>{

const doc = new jsPDF()

doc.text(
'Bank List Report',
14,
20
)

autoTable(doc,{
head:[[
'Code',
'Bank',
'Branch',
'Account No',
'Holder'
]],

body:filteredBanks.map(b=>[
b.bank_code,
b.bank_name,
b.branch_name,
b.account_number,
b.account_holder_name
]),

startY:30
})

doc.save('banks.pdf')

toast.success('PDF exported')
}



const handleFileUpload=(e)=>{
const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload=(event)=>{
try{

const data = new Uint8Array(
event.target.result
)

const workbook = XLSX.read(
data,
{type:'array'}
)

const worksheet =
workbook.Sheets[
workbook.SheetNames[0]
]

const jsonData =
XLSX.utils.sheet_to_json(
worksheet
)

const newBanks = jsonData.map(item=>({
bank_code:generateBankCode(),
bank_name:item['Bank Name'] || '',
branch_name:item['Branch'] || '',
account_number:item['Account Number'] || '',
account_holder_name:item['Account Holder'] || ''
}))

setBanks(prev=>[
...prev,
...newBanks
])

toast.success(
`${newBanks.length} banks imported`
)

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
'Bank Code':'BANK-000001',
'Bank Name':'Commercial Bank',
'Branch':'Negombo',
'Account Number':'123456789',
'Account Holder':'John Silva'
}
]

const ws = XLSX.utils.json_to_sheet(data)
const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
wb,
ws,
'Template'
)

XLSX.writeFile(
wb,
'bank_template.xlsx'
)

}



const handleDelete = async(bank)=>{

const id = bank?.id

if(!id){
toast.error('Invalid bank ID')
return
}

try{

await axios.delete(`/banks/${id}`)

toast.success('Bank deleted')

setDeleteDialog({
open:false,
bank:null
})

fetchBanks()

}catch(error){
toast.error('Delete failed')
}
}



const openEditDialog=(bank)=>{
setEditDialog({
open:true,
bank
})

setEditForm(bank)
}



const handleUpdate=async()=>{

try{

await axios.put(
`/banks/${editForm.id}`,
editForm
)

toast.success(
'Bank updated'
)

setEditDialog({
open:false,
bank:null
})

fetchBanks()

}catch(error){
toast.error(
'Update failed'
)
}
}



return(
<div className="container mx-auto px-4 py-6 space-y-6">

<div className="flex justify-between items-center">

<div>
<CardTitle className="text-3xl">
Bank List
</CardTitle>

<CardDescription>
Manage bank records
</CardDescription>

</div>

<Button onClick={handleAddBank}>
<Plus className="mr-2 h-4 w-4"/>
Add Bank
</Button>

</div>


<Card>
<CardContent className="pt-6">

<div className="flex gap-3 flex-wrap">

<div className="relative flex-1">
<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
placeholder="Search banks..."
value={searchTerm}
onChange={(e)=>
setSearchTerm(
e.target.value
)
}
className="pl-10"
/>

</div>


<Button
variant="outline"
onClick={exportToExcel}
>
<Download className="mr-2 h-4 w-4"/>
Excel
</Button>


<Button
variant="outline"
onClick={exportToPDF}
>
<FileText className="mr-2 h-4 w-4"/>
PDF
</Button>





</div>
</CardContent>
</Card>



<Card>

<CardHeader>

<CardTitle>
Banks
</CardTitle>

<CardDescription>
{filteredBanks.length} banks found
</CardDescription>

</CardHeader>


<CardContent>

<Table>

<TableHeader>
<TableRow>
<TableHead>Bank Code</TableHead>
<TableHead>Bank Name</TableHead>
<TableHead>Branch</TableHead>
<TableHead>Account Number</TableHead>
<TableHead>Holder</TableHead>
<TableHead className="text-right">
Actions
</TableHead>
</TableRow>
</TableHeader>


<TableBody>

{filteredBanks.map(bank=>(

<TableRow key={bank.id}>

<TableCell>
{bank.bank_code}
</TableCell>

<TableCell>
<div className="flex items-center gap-2">
<Building2 className="h-4 w-4 text-muted-foreground"/>
{bank.bank_name}
</div>
</TableCell>

<TableCell>
{bank.branch_name}
</TableCell>

<TableCell>
{bank.account_number}
</TableCell>

<TableCell>
{bank.account_holder_name}
</TableCell>


<TableCell className="text-right">

<DropdownMenu>

<DropdownMenuTrigger asChild>
<Button
variant="ghost"
size="icon"
>
<MoreVertical className="h-4 w-4"/>
</Button>
</DropdownMenuTrigger>


<DropdownMenuContent align="end">

<DropdownMenuItem
onClick={()=>openEditDialog(bank)}
>
<Edit className="mr-2 h-4 w-4"/>
Edit
</DropdownMenuItem>


<DropdownMenuItem
onClick={()=>setDeleteDialog({
open:true,
bank
})}
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
bank:null
})
}
>

<DialogContent>

<DialogHeader>
<DialogTitle>
Delete Bank
</DialogTitle>

<DialogDescription>
Delete {deleteDialog.bank?.bank_name} ?
</DialogDescription>

</DialogHeader>


<DialogFooter>

<Button
variant="outline"
onClick={()=>
setDeleteDialog({
open:false,
bank:null
})
}
>
Cancel
</Button>

<Button
variant="destructive"
onClick={()=>
handleDelete(
deleteDialog.bank
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
bank:null
})
}
>

<DialogContent>

<DialogHeader>
<DialogTitle>
Edit Bank
</DialogTitle>
</DialogHeader>


<div className="space-y-4">

<div>
<Label>Bank Name</Label>

<Input
value={editForm.bank_name || ''}
onChange={(e)=>
setEditForm({
...editForm,
bank_name:e.target.value
})
}
/>

</div>


<div>
<Label>Branch</Label>

<Input
value={editForm.branch_name || ''}
onChange={(e)=>
setEditForm({
...editForm,
branch_name:e.target.value
})
}
/>

</div>


<div>
<Label>Account Number</Label>

<Input
value={editForm.account_number || ''}
onChange={(e)=>
setEditForm({
...editForm,
account_number:e.target.value
})
}
/>

</div>


<div>
<Label>Account Holder</Label>

<Input
value={editForm.account_holder_name || ''}
onChange={(e)=>
setEditForm({
...editForm,
account_holder_name:e.target.value
})
}
/>

</div>

</div>



<DialogFooter>

<Button
variant="outline"
onClick={()=>
setEditDialog({
open:false,
bank:null
})
}
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
<DialogTitle>
Import Banks
</DialogTitle>
</DialogHeader>


<div
className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
onClick={()=>
fileInputRef.current?.click()
}
>

<Upload className="mx-auto h-8 w-8 mb-2"/>

<p>
Click to upload Excel
</p>

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