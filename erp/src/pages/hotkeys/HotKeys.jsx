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
        hotkeys('alt+h', ()=>{
            navigate('/');
            return false;
        })

        //Product
        hotkeys('alt+p', () => {
            navigate('/products/list');
            return false;
        });

        //Category
        hotkeys('alt+c', () => {
            navigate('/category/list');
            return false;
        })

        //Brand
        hotkeys('alt+b', () => {
            navigate('/brand/list');
            return false;
        })

        //Branch
        hotkeys('shift+b', () => {
            navigate('/branch/list');
            return false;
        })

        //Department
        hotkeys('alt+d', () => {
            navigate('/department/list');
            return false;
        })

        //Customer
        hotkeys('shift+c', () => {
            navigate('/customer/list');
            return false;
        })

        //Supplier
        hotkeys('alt+s', () => {
            navigate('/supplier/list');
            return false;
        })

        //Employee
        hotkeys('alt+e', () => {
            navigate('/employee/list');
            return false;
        })

        // Cleanup
        return () => {
            hotkeys.unbind();
        };
    }, [navigate]);

    return null;
}