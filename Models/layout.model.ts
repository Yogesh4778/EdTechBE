import {Schema, model, Document} from "mongoose";

interface FaqItem extends Document{
    question: string;
    answer: string;
}

interface Category extends Document {
    title: string;
}

interface BannerImage extends Document{ 
    public_id: string;
    url: string;
}
    
interface layout extends Document{
    type:string;
    faq:FaqItem[];
    category:Category[];
    banner:{
        image:BannerImage;
        title:string;
        subtitle:string;
    }
}

const FaqSchema= new Schema<FaqItem>({
   question:{type:String},
   answer:{type:String},
});

const CategorySchema= new Schema<Category>({
    title:{type:String},
});

const BannerImageSchema= new Schema<BannerImage>({
    public_id:{type:String},
    url:{type:String}
});

const layoutSchema= new Schema<layout>({
    type:{type:String},
    faq:{FaqSchema},
    category:{CategorySchema},
    banner:{
        image:BannerImageSchema,
        title:{type:String},
        subtitle:{type:String}
    }
});

const layoutModel=model<layout>('layout',layoutSchema);

export default layoutModel;