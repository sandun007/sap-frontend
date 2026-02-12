import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hotkeys from 'hotkeys-js';
import {toast} from "sonner";

export default function HotKeys() {
    const navigate = useNavigate();

    useEffect(() => {

        hotkeys.filter = function (event) {
            const tagName = (event.target || event.srcElement).tagName;
            return (
                tagName !== 'INPUT' &&
                tagName !== 'SELECT' &&
                tagName !== 'TEXTAREA' &&
                !(event.target || event.srcElement).isContentEditable
            );
        };

        //Home Dashboard
        hotkeys('ctrl+h', ()=>{
            navigate('/');
            return false;
        })

        //Product
        hotkeys('ctrl+p', () => {
            navigate('/products/list');
            return false;
        });

        //Category
        hotkeys('ctrl+c', () => {
            navigate('/category/list');
            return false;
        })

        //Brand
        hotkeys('ctrl+b', () => {
            navigate('/brand/list');
            return false;
        })

        //Branch
        hotkeys('shift+b', () => {
            navigate('/branch/list');
            return false;
        })

        //Department
        hotkeys('ctrl+d', () => {
            navigate('/department/list');
            return false;
        })

        //Customer
        hotkeys('shift+c', () => {
            navigate('/customer/list');
            return false;
        })

        //Supplier
        hotkeys('ctrl+s', () => {
            navigate('/supplier/list');
            return false;
        })

        //Employee
        hotkeys('ctrl+e', () => {
            navigate('/employee/list');
            return false;
        })

        //Show shortcuts
        hotkeys('1', () => {
            toast(
                <div style={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                    {`
                    Ctrl+H => Home Dashboard
                    Ctrl+P => Products
                    Ctrl+C => Categories
                    Ctrl+B => Brands
                    Shift+B => Branches
                    Ctrl+D => Departments
                    Shift+C => Customers
                    Ctrl+S => Suppliers
                    Ctrl+E => Employees
                    `}
                </div>,
                {
                    duration: 8000,
                    position: 'top-center',
                });
            return false;
        });

        // Cleanup
        return () => {
            hotkeys.unbind();
        };
    }, [navigate]);

    return null;
}