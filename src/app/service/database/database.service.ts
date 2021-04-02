import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
db: any;
  constructor(public http: HttpClient, public sqlite: SQLite, public platform: Platform) {

  }

  /**
   * Open the local database
   */
  openDataBase(): Promise<any> {
    return new Promise((resolve) => {
      this.platform.ready().then(() => {
        if(this.platform.is('cordova')){
          this.sqlite.create({
            name: 'attendance.db',
            location: 'default' 
          })
            .then((db: SQLiteObject) => {
              this.db = db;
              resolve(true);
            })
        }else{
          resolve(true)
        }
      })
    })
  }

  /**
   * Create classes, students, private_message, parent_connect table 
   */
  createTable(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.platform.ready().then(() => {
        if(this.platform.is('cordova')){
          this.sqlite.create({
            name: 'attendance.db',
            location: 'default'
          })
            .then((db: SQLiteObject) => {
              this.db = db;
              db.executeSql(`CREATE TABLE IF NOT EXISTS classes( 
                              cid INT PRIMARY KEY,
                              name VARCHAR(50),
                              desc VARCHAR(50),
                              code VARCHAR(10))`, [])
                .then(() => {
                  console.log('classes Table created');
                  db.executeSql(`CREATE TABLE IF NOT EXISTS students(
                      sid INT,
                      name VARCHAR(50), 
                      pic TEXT,
                      cid INT,
                      add_ranking FLOAT,
                      medical_days INTEGER, 
                      suspend_days INTEGER, 
                      total_absent INTEGER, 
                      unacceptable_absent_days INTEGER,
                      total_delay INTEGER,
                      zero INTEGER,
                      one INTEGER,
                      delay_rule INTEGER)`, [])
                    .then(() => {
                      console.log('students Table created')
                      db.executeSql(`CREATE TABLE IF NOT EXISTS private_message(
                                    ID BIGINT PRIMARY KEY,
                                    date datetime, 
                                    first_name varchar(50),
                                    notification TEXT,
                                    pic TEXT,
                                    status INT,
                                    title VARCHAR(50),
                                    user_no INT,
                                    user_right VARCHAR(5),
                                    user_type INT)`, [])
                        .then(() => {
                          console.log('private_message Table created');
                          db.executeSql(`CREATE TABLE IF NOT EXISTS parent_connect(
                            id BIGINT PRIMARY KEY,
                            created datetime, 
                            first_name varchar(50),
                            last_name varchar(50),
                            message VARCHAR(150),
                            name VARCHAR(150),
                            parent_user_no INT,
                            pic TEXT,
                            school_id INT,
                            ticket_status INT,
                            ticket_status_updated_by BIGINT,
                            title VARCHAR(50),
                            updated_time TIMESTAMP)`, []).then(() => {
                            console.log('parent_connect Table created');
                              db.executeSql(`CREATE TABLE IF NOT EXISTS news(
                                id INT PRIMARY KEY,
                                ago VARCHAR(20), 
                                already_like varchar(10),
                                content TEXT,
                                detail TEXT,
                                school_id INT,
                                news_image TEXT,
                                school_logo TEXT,
                                school_name TEXT,
                                status INT,
                                title VARCHAR(150),
                                total_likes INT
                                )`, []).then(() => {

                                console.log('parent_connect Table created');
                                resolve(true);
                              })
                              .catch(e => {
                                console.log(e);
                                reject(false);
                              });
                          })
                            .catch(e => {
                              console.log(e);
                              reject(false);
                            });
                        })
                        .catch(e => {
                          console.log(e);
                          reject(false);
                        });
                    })
                    .catch(e => {
                      console.log(e);
                      reject(false);
                    });
  
                })
                .catch(e => {
                  console.log(e);
                  reject(false);
                });
  
            })
            .catch(e => {
              console.log(e)
              reject(false);
            }); 
        }else{
          resolve(true);
        }
      })
    })
  }

  /**
   * insert or update the private messages locally
   * @param classes Array of class object
   */
  insertNews(recentNews: Array<any>) {
    if(this.platform.is('cordova')){
      this.db.executeSql('DELETE From news', []).then(()=>{
        recentNews.forEach((news) => {
          this.db.executeSql(`INSERT INTO news (id, ago, already_like, content, detail, school_id, news_image, school_logo, school_name, status, title, total_likes) 
          VALUES(${news.id}, "${news.ago}", "${news.already_like}", "${news.content}", "${news.detail}", "${news.news_image}", ${news.school_id}, "${news.school_logo}", "${news.school_name}", "${news.status}", "${news.title}", ${news.total_likes})`, []).then(() => {
            console.log(news.id, " inserted");
          }).catch((err) => {
            console.log(`INSERT INTO news (id, ago, already_like, content, detail, school_id, news_image, school_logo, school_name, status, title, total_likes) 
            VALUES(${news.id}, "${news.ago}", "${news.already_like}", "${news.content}", "${news.detail}", "${news.news_image}", ${news.school_id}, "${news.school_logo}", "${news.school_name}", "${news.status}", "${news.title}", ${news.total_likes})`)
            console.log(err);
          })
        })
      })
    }
  }

  /**
   * Get latest local news
   */
  getNews(): Promise<any>{
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from news', []).then((response) => {
        let news = [];
        for (let i = 0; i < response.rows.length; i++) {
          let data = response.rows.item(i);
          if(data.news_image){
            data.news_image = './assets/imgs/no-preview.png';
          }
          data.school_logo = '';
          news.push(data);
        }
        console.log(news);
        resolve(news);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }

  /**
   * insert or update the classes locally
   * @param classes Array of class object
   */
  insertClasses(classes: Array<any>) {
    if(this.platform.is('cordova')){
      classes.forEach((data) => {
        this.db.executeSql(`INSERT OR REPLACE INTO classes (cid, name, desc, code) 
        VALUES(${data.cid}, "${data.name}", "${data.desc}", "${data.code}")`, []).then(() => {
          console.log(data.name, " inserted");
        }).catch((err) => {
          console.log(err);
        })
      })
    }
  }

  /**
   * Return the classes stored locally
   */
  getClasses(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from classes', []).then((response) => {
        let classes = [];
        for (let i = 0; i < response.rows.length; i++) {
          classes.push(response.rows.item(i));
        }
        resolve(classes);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }

  /**
   * Insert students locally
   * @param students Arrya contains the student object
   */
  insertStudentList(students: Array<any>, delay_rule:any) {
    if(this.platform.is('cordova')){
      students.forEach((student) => {
        if(student.add_ranking == undefined){
          student.add_ranking = 0;
        }
        if(student.total_delay == undefined){
          student.total_delay = 0;
        }
        if(student.useedforabsent == undefined){
          student.useedforabsent = {zero: 0, one: 0};
        }
        
        this.db.executeSql(`Select sid from students where sid = "${student.sid}" and cid = "${student.cid}"`, []).then((response) => {
          if (response.rows.length > 0) {
            this.db.executeSql('UPDATE students SET name = ?, pic = ?, add_ranking =?, medical_days = ?, suspend_days =?, total_absent=?, unacceptable_absent_days = ?, total_delay = ?, zero = ?, one = ?, delay_rule = ? WHERE sid = "' + student.sid + '" and cid = "'+student.cid+'"',
              [student.name, student.pic, student.add_ranking, student.medical_days, student.suspend_days, student.total_absent, student.unacceptable_absent_days, student.total_delay, student.useedforabsent.zero, student.useedforabsent.one, delay_rule]).catch((err) => {
                console.log(err)
              }).then(() => {
                console.log("Student updated successfully")
              })
          } else {
            this.db.executeSql(`INSERT  INTO students (sid, name, pic, cid, add_ranking, medical_days, suspend_days, total_absent, unacceptable_absent_days, total_delay, zero, one, delay_rule)
                                  VALUES(${student.sid},"${student.name}","${student.pic}",${student.cid},${student.add_ranking},${student.medical_days},${student.suspend_days},
                                  ${student.total_absent},${student.unacceptable_absent_days}, ${student.total_delay}, ${student.useedforabsent.zero}, ${student.useedforabsent.one}, ${delay_rule})`,
              []).then(() => {
                console.log("Student inserted successfully")
              }).catch((err) => {
                console.log("insert error");
                console.log(err)
              })
          }
        })
      })
    }
  }

  /**
   * Get the student list registered for particular course/class
   * @param cid Contains the course id
   */
  getStudentList(cid):Promise<any>{
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from students WHERE cid = '+cid, []).then((response) => {
        let students = [];
        for (let i = 0; i < response.rows.length; i++) {
          let student = response.rows.item(i);
          student.sheet = [];
          student.useedforabsent = {zero: student.zero, one: student.one};
          students.push(student);
        }
        resolve(students);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }  

  getStudent(sid):Promise<any>{
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from students WHERE sid = '+sid, []).then((response) => {
        let students = [];
        for (let i = 0; i < response.rows.length; i++) {
          let student = response.rows.item(i);
          student.sheet = [];
          student.useedforabsent = {zero: student.zero, one: student.one};
          students.push(student);
        }
        resolve(response);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }


  /**
   * insert or update the private messages locally
   * @param classes Array of class object
   */
  insertPrivateMessages(messages: Array<any>) {
    if(this.platform.is('cordova')){
      messages.forEach((message) => {
        this.db.executeSql(`INSERT OR REPLACE INTO private_message (ID, date, first_name, notification, pic, status, title, user_no, user_right, user_type) 
        VALUES(${message.ID}, "${message.date}", "${message.first_name}", "${message.notification}", "${message.pic}", ${message.status}, "${message.title}", ${message.user_no}, "${message.user_right}", ${message.user_type})`, []).then(() => {
          console.log(message.ID, " inserted");
        }).catch((err) => {
          console.log(err);
        })
      })
    }
  }

  /**
   * Get the Private messages
   */
  getPrivateMessages():Promise<any>{
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from private_message', []).then((response) => {
        let messages = [];
        for (let i = 0; i < response.rows.length; i++) {
          messages.push(response.rows.item(i));
        }
        resolve(messages);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }

  /**
   * insert or update the Parent connect support ticket
   * @param classes Array of class object
   */
  insertParentConnectMessages(messages: Array<any>) {
    if(this.platform.is('cordova')){
      messages.forEach((message) => {
        this.db.executeSql(`INSERT OR REPLACE INTO parent_connect (id, created, first_name, last_name, message, name, parent_user_no, pic, school_id, ticket_status, ticket_status_updated_by, title, updated_time) 
        VALUES(${message.id}, "${message.created}", "${message.first_name}", "${message.last_name}", "${message.message}", "${message.name}", ${message.parent_user_no}, "${message.pic}", ${message.school_id}, ${message.ticket_status}, ${message.ticket_status_updated_by}, "${message.title}", "${message.updated_time}")`, []).then(() => {
          console.log(message.id, " inserted");
        }).catch((err) => {
          console.log(err);
        })
      })
    }
  }

  /**
   * Get the student list registered for particular course/class
   */
  getParentConnectMessages():Promise<any>{
    return new Promise((resolve, reject) => {
      this.db.executeSql('SELECT * from parent_connect', []).then((response) => {
        let messages = [];
        for (let i = 0; i < response.rows.length; i++) {
          messages.push(response.rows.item(i));
        }
        resolve(messages);
      }).catch((error) => {
        console.log(error);
        reject("Some problem exist try again later");
      })
    })
  }

  /**
   * truncate the table when user logged out
   */
  deleteDataBase() {
    if(this.platform.is('cordova')){
      this.db.executeSql('DELETE FROM classes', []).then(() => {
        console.log("Table deleted");
      })
      this.db.executeSql('DELETE FROM students', []).then(() => {
        console.log("Table deleted");
      })
      this.db.executeSql('DELETE FROM private_message', []).then(() => {
        console.log("Table deleted");
      })
      this.db.executeSql('DELETE FROM parent_connect', []).then(() => {
        console.log("Table deleted");
      })
    }
  }
}
