export class AbstractListItem {
    text: string;
    desc?: string;
    date: Date;
    completed: boolean;

    constructor(text: string) {
        this.text = text;
        this.date = new Date();
        this.completed = false;
    }

    static fromPlainObject(obj: any): AbstractListItem {
        const listItem = new AbstractListItem(obj.text);
        listItem.desc = obj.desc;
        listItem.completed = obj.completed;
        listItem.date = new Date(obj.date);
        return listItem;
    }
}

export class AbstractList {
    id?: string;
    title: string;
    items: AbstractListItem[];
    date: Date;

    constructor(title: string, id?: string) {
        this.title = title;
        this.items = [];
        this.date = new Date();
        if(id) {
            this.id = id;
        }
    }

    returnDate() {
        if(this.date === null) {
            return "";
        }else {
            return this.date.toString();
        }
    }

    // deep copy
    static fromPlainObject(obj: any): AbstractList {
        const list = new AbstractList(obj.title);
        list.id = obj.id;
        list.items = obj.items.map((item: any) => {
            const listItem = new AbstractListItem(item.text);
            listItem.desc = item.desc;
            listItem.completed = item.completed;
            listItem.date = new Date(item.date);
            return listItem;
        });
        list.date = new Date(obj.date);
        return list;
    }

    static parseMongoDBObject(obj: any): AbstractList {
        const list = new AbstractList(obj.title);
        list.id = obj._id; //Take the MongoDB ID
        list.items = obj.items.map((item: any) => {
            const listItem = new AbstractListItem(item.text);
            listItem.desc = item.desc;
            listItem.completed = item.completed;
            listItem.date = new Date(item.date);
            return listItem;
        });
        list.date = new Date(obj.date);
        return list;
    }
}

export enum NotificationFrequency {
    IMMEDIATE = "immediate",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    NEVER = "never",
}
  