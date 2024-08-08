import React from "react";
import SalesSummary from "../../components/Dashboard/SalesSummary";
import OrdersSummary from "../../components/Dashboard/OrdersSummary";
import ProductsSummary from "../../components/Dashboard/ProductsSummary";
import CustomersSummary from "../../components/Dashboard/CustomersSummary";
import MonthlySalesCurve from "../../components/Dashboard/MonthlySalesCurve";
import YearlySalesCurve from "../../components/Dashboard/YearlySalesCurve";
import SalesByCategory from "../../components/Dashboard/SalesByCategory";
import SalesOverYears from "../../components/Dashboard/SalesOverYears";
import RecentOrders from "../../components/Dashboard/RecentOrders";
import {useOrdersContext} from "../../hooks/useOrdersContext";
import { useState, useEffect } from "react";



const DashBoard = () => {


    const {orders} = useOrdersContext();

    const [monthlySalesData, setMonthlySalesData] = useState([]);
    const [yearlySalesData, setYearlySalesData] = useState([]);
    const [salesOverYearsData, setSalesOverYearsData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recentOrdersData, setRecentOrdersData] = useState([]);
    const [totalOrdersPrice, setTotalOrdersPrice] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalCustomers, setTotalCustomers] = useState(0)

   
    // Calculate total sales, total products, total customers, monthly sales, yearly sales, sales over years, categories and recent orders
    useEffect(() => {

        if(!orders){
            return
        }

        const calculateTotalPrices = () => {
            const total = orders.reduce((acc, order) => acc + order.totalPrice, 0);
            setTotalOrdersPrice(parseFloat(total.toFixed(2)));
        };
    
        const calculateTotalProducts = () => {
            const totalProducts = orders.reduce((acc, order) => acc + order.products.length, 0);
            setTotalProducts(totalProducts)
        };
    
        const calculateTotalCustomers = () => {
            const uniqueCustomers = new Set(orders.map(order => order.customer));
            setTotalCustomers(uniqueCustomers.size)
        };
        
    
        const montlySalesHandler = () => {
            const monthlySales = orders.reduce((acc, order) => {
                const date = new Date(order.createdAt).toISOString().split('T')[0];
                const existing = acc.find(item => item.date === date);
                if (existing) {
                    existing.sales += order.totalPrice;
                } else {
                    acc.push({ date, sales: order.totalPrice });
                }
                return acc;
            }, []);
    
    
            // Fix sales values to have just 2 digits
            const fixedMonthlySales = monthlySales.map(sale => ({
                date: sale.date,
                sales: parseFloat(sale.sales.toFixed(2))
            }));
    
            setMonthlySalesData(fixedMonthlySales);
        }
    
        const yearlySalesHandler = () => {
            const yearlySales = orders.reduce((acc, order) => {
                const month = new Date(order.createdAt).toLocaleString('default', { month: 'long' });
                const existing = acc.find(item => item.month === month);
                if (existing) {
                    existing.sales += order.totalPrice;
                } else {
                    acc.push({ month, sales: order.totalPrice });
                }
                return acc;
            }, []);
    
             // Fix sales values to have just 2 digits
             const fixedYearlySales = yearlySales.map(sale => ({
                month: sale.month,
                sales: parseFloat(sale.sales.toFixed(2))
            }));
    
            setYearlySalesData(fixedYearlySales);
        }
    
        const overYearSalesHandler = () =>{
            const salesYears = orders.reduce((acc, order) => {
                const year = new Date(order.createdAt).getFullYear();
                const existing = acc.find(item => item.year === year.toString());
                if (existing) {
                    existing.sales += order.totalPrice;
                } else {
                    acc.push({ year: year.toString(), sales: order.totalPrice });
                }
                return acc;
            }, []);
    
             // Fix sales values to have just 2 digits
             const fixedOverYearSales = salesYears.map(sale => ({
                year: sale.year,
                sales: parseFloat(sale.sales.toFixed(2))
            }));
    
            setSalesOverYearsData(fixedOverYearSales);
    
        }
    
        const categoriesHandler = () =>{
            const categories = orders.reduce((acc, order) => {
                order.products.forEach(product => {
                    const existing = acc.find(item => item.name === product.category);
                    if (existing) {
                        existing.value += product.price * product.quantity;
                    } else {
                        acc.push({ name: product.category, value: product.price * product.quantity });
                    }
                });
                return acc;
            }, []);
    
             // Fix prices to have just 2 digits
            const fixedCategories = categories.map(category => ({
                name: category.name,
                value: parseFloat(category.value.toFixed(2))
            }));
            setCategoryData(fixedCategories);
        }
        // Filter and transform monthly sales data
        montlySalesHandler()

        // Filter and transform yearly sales data
       yearlySalesHandler()


        // Filter and transform sales over years data
        overYearSalesHandler()

        // Filter and transform category data
       categoriesHandler()

        // Get recent orders
        const recentOrders = orders.slice(-5);
        setRecentOrdersData(recentOrders);

        calculateTotalPrices()

        calculateTotalProducts()

        calculateTotalCustomers()

    }, [orders]);


    if (!orders) {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        );
      }

  
    

    return (
        <div className="bg-gray-200 text-primary1 font-sans min-h-screen flex flex-col">
           
            <main className="xl:w-10/12 xl:m-auto flex-grow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SalesSummary totalSales={totalOrdersPrice}/>
                    <OrdersSummary totalOrders={orders.length}/>
                    <ProductsSummary totalProducts={totalProducts}/>
                    <CustomersSummary totalCustomers={totalCustomers}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <MonthlySalesCurve data={monthlySalesData} />
                    <SalesByCategory data={categoryData} />
                     
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                   
                    <YearlySalesCurve data={yearlySalesData} />
                    <SalesOverYears data={salesOverYearsData} />
                </div>

                <RecentOrders resentOrdersData={recentOrdersData}/>
              
            </main>
            
        </div>
    );
};

export default DashBoard;
