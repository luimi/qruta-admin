import { Injectable } from '@angular/core';
import Parse from 'parse';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  roleAdmin: any;

  scheduleModel = [
    ["weekdaysFirstHour", "lvhi"],
    ["weekdaysLastHour", "lvhf"],
    ["weekdaysValley", "lvfv"],
    ["weekdaysPeak", "lvfp"],
    ["saturdayFirstHour", "shi"],
    ["saturdayLastHour", "shf"],
    ["saturdayValley", "sfv"],
    ["saturdayPeak", "sfp"],
    ["sundayFirstHour", "dfhi"],
    ["sundayLastHour", "dfhf"],
    ["sundayValley", "dffv"],
    ["sundayPeak", "dffp"]
  ]

  constructor() { }
  public validate(values: any[], messages: string[], success: any, error: any) {
    let result = true;
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) {
        result = false;
        error(messages[i]);
        break;
      }
    }
    if (result) {
      success();
    }
  }
  public makeId(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  public async isAdmin() {
    if (!this.roleAdmin)
      this.roleAdmin = await new Parse.Query(Parse.Role).equalTo('name', 'admin').equalTo('users', Parse.User.current()).first();
    return this.roleAdmin !== undefined;
  }
  public genericObject(className: string){
    const Generic = Parse.Object.extend(className);
    return new Generic();
  }
  public async getACL() {
    const roles = await new Parse.Query(Parse.Role).find();
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    roles.forEach((role) => {
      acl.setRoleWriteAccess(role, true);
    });
    return acl;
  }
  public getSchedule(data: any, type: "local" | "server") {
    let schedule: any = {}
    this.scheduleModel.forEach((values) => {
      schedule[values[type === "local" ? 0 : 1]] = data[values[type === "local" ? 1 : 0]] ? data[values[type === "local" ? 1 : 0]] : ""
    })
    return schedule
  }

  public convertFileToBase64(file: any) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // The onloadend event is triggered when the reading operation is complete
        reader.onloadend = () => {
            resolve(reader.result);
        };
        // The onerror event is triggered if an error occurs
        reader.onerror = (error) => {
            reject(error);
        };
        // Read the file's data as a Data URL (which includes the Base64 string)
        reader.readAsDataURL(file);
    });
};

}
