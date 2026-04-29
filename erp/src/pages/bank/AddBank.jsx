import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
Save,
X,
Building2,
MapPin,
CreditCard,
User
} from 'lucide-react'

import axios from 'axios'

export default function AddBank() {

    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2,'0')
        const day = String(date.getDate()).padStart(2,'0')

        return `${year}-${month}-${day}`
    }

    function generateBankCode(banks) {
    if (!banks || banks.length === 0) {
        return "BANK-0001";
    }

    const lastCode = banks[banks.length - 1]?.bank_code;

    const lastNumber = parseInt(lastCode?.split("-")[1] || "0");

    const nextNumber = lastNumber + 1;

    return `BANK-${String(nextNumber).padStart(4, "0")}`;
}

    const initialState = {
        bank_code: generateBankCode(),
        bank_name:'',
        branch_name:'',
        account_number:'',
        account_holder_name:'',
        created_date: formatDate(new Date())
    }

    const [formData,setFormData] = useState(initialState)

    const handleInputChange=(field,value)=>{
        setFormData(prev=>({
            ...prev,
            [field]:value
        }))
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        if(!formData.bank_name){
            toast.error('Bank name is required')
            return
        }

        if(!formData.branch_name){
            toast.error('Branch name is required')
            return
        }

        if(!formData.account_number){
            toast.error('Account number is required')
            return
        }

        try{

            const response = await axios.post('/banks',formData)

            const newBank = response.data?.data || response.data

            const realId = newBank?.bank_id || newBank?.id || '—'

            toast.success(`Bank created successfully! ID: ${realId}`)

            setFormData({
                ...initialState,
                bank_code:generateBankCode()
            })

        }catch(error){
            console.error(error)
            toast.error('Failed to create bank')
        }
    }

    const handleClear=()=>{
        setFormData({
            ...initialState,
            bank_code:generateBankCode()
        })

        toast.info('Form cleared')
    }

return(
<div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">

{/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">

<div>
<h1 className="text-2xl sm:text-3xl font-bold">
Add New Bank
</h1>

<p className="text-muted-foreground">
Create a new bank record
</p>

</div>

<Badge
variant="secondary"
className="text-xs sm:text-sm px-3 py-1"
>
Bank Code: {formData.bank_code}
</Badge>

</div>


<form onSubmit={handleSubmit}>

<Card>

<CardHeader>
<CardTitle>Bank Information</CardTitle>

<CardDescription>
Enter bank and account details
</CardDescription>

</CardHeader>


<CardContent className="space-y-4">

{/* Bank Name */}
<div className="space-y-2">

<Label htmlFor="bank_name">
Bank Name
</Label>

<div className="relative">
<Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
id="bank_name"
value={formData.bank_name}
onChange={(e)=>
handleInputChange(
'bank_name',
e.target.value
)
}
placeholder="Commercial Bank"
className="pl-10"
required
/>

</div>
</div>


{/* Branch + Account Number */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

<div className="space-y-2">

<Label htmlFor="branch_name">
Branch Name
</Label>

<div className="relative">
<MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
id="branch_name"
value={formData.branch_name}
onChange={(e)=>
handleInputChange(
'branch_name',
e.target.value
)
}
placeholder="Negombo Branch"
className="pl-10"
/>

</div>
</div>


<div className="space-y-2">

<Label htmlFor="account_number">
Account Number
</Label>

<div className="relative">
<CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
id="account_number"
value={formData.account_number}
onChange={(e)=>
handleInputChange(
'account_number',
e.target.value
)
}
placeholder="1234567890"
className="pl-10"
/>

</div>
</div>

</div>


{/* Account Holder */}
<div className="space-y-2">

<Label htmlFor="account_holder_name">
Account Holder Name
</Label>

<div className="relative">
<User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

<Input
id="account_holder_name"
value={formData.account_holder_name}
onChange={(e)=>
handleInputChange(
'account_holder_name',
e.target.value
)
}
placeholder="John Silva"
className="pl-10"
/>

</div>

</div>

</CardContent>

</Card>


{/* Buttons */}
<div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t">

<Button
type="button"
variant="outline"
onClick={handleClear}
className="w-full sm:w-auto"
>
<X className="h-4 w-4 mr-2"/>
Clear Form
</Button>

<Button
type="submit"
className="w-full sm:w-auto gap-2"
>
<Save className="h-4 w-4"/>
Save Bank
</Button>

</div>

</form>

</div>
)
}