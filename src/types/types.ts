import { NextFunction, Request, Response } from "express";
import { type } from "os";


export interface NewUserRequestBody {
    name: string;
    email: string;
    photo: string;
    gender: string;
    dob: Date;
    _id: string;
  }

  export interface NewProductRequestBody {
    name: string;
    category: string;
    price: number;
    stock: number;
    description: string
  
  }


export type ControllerType = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>> | undefined>


export type SearchRequestQuery = {
  search?: string
  price?: string
  category?: string
  sort?: string
  page?: string
}

export interface BaseQuery {
  name?: {
    $regex:string, 
    $options:string
  }

  price?: {
    $lte:Number
  }
  category?:string


}

// TO Generate Fake Produts
export interface ProductDocument extends Document {
    name: string;
    photo: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export type invalidateCacheProps = {
  product?: boolean
  order?: boolean
  admin?: boolean
  review?: boolean
  userId?: string
  orderId?: string
  productId?: string | string[]
}


export type OrderItemType = {
  name: string
  photo: string
  price: number
  quantity:number
  productId: string

}

export type ShippingInfoType = {
  address: string
  city: string
  state: string
  country:string
  pinCode: number
}

export interface NewOrderRequestBody{
  shippingInfo: ShippingInfoType
  user: string
  subtotal: number
  tax: number
  shippingCharges: number
  discount: number
  total: number
  orderItems: OrderItemType[]
}