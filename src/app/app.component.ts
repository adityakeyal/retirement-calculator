import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    this.calculateAge();

    const data = window.localStorage.getItem('data');
    // console.log(data)
    if(data){
      const basicdata = JSON.parse(data);

      this.basicdata = Object.assign(new BasicData, basicdata)
      ;



    }

    console.log("###################################")
    setInterval(()=>{
      this.saveData()
    },10000)

  }






  title = 'retirement-calculators';


  basicdata = new BasicData();




  updateAnnual(value : Expense){
    value.annualAmount = value.monthlyAmount * 12;
  }
  updateMonthly(value: Expense){
    value.monthlyAmount = value.annualAmount / 12;
  }


  addExpense(){
    this.basicdata.expenses.push(new Expense())
  }
  removeExpense(idx:number){
    this.basicdata.expenses.splice(idx,1)
  }



  addInvestment(){
    this.basicdata.investment.push(new Investment())
  }
  removeInvestment(idx:number){
    this.basicdata.investment.splice(idx,1)
  }


  calculateAge(){


    this.basicdata.age = moment().diff(moment(this.basicdata.dateOfBirth),'y')
    const retirementDate=moment(this.basicdata.dateOfBirth).add(this.basicdata.retirementAge,'y');
    this.basicdata.retirementDate = retirementDate.format('yyyy-MM-DD');
    this.basicdata.monthsToRetirement=retirementDate.diff(moment(),'M');
    this.basicdata.yearsToRetirement=retirementDate.diff(moment(),'y');
    

      // console.log(moment(this.basicdata.dateOfBirth).diff(,'y'));
      // console.log(moment(this.basicdata.dateOfBirth).diff(moment.now(),'day'));


  }



  calculateTotal(value:Investment){

    value.total=convertToDecimal(this.topupCompounding(value.initialAmount,value.sip,value.roi,value.term*12 , value.compunding , value.stepUp))

  }


  topupCompounding( initialAmount : number,  amount : number, roi : number, months : number, coumpoundingFrequency : number, topupPercent : number) {
    let total = 0;
    let tempInterest  = initialAmount;
    for(let i=0;i<months;i++)
    {
      total = total + amount;
      let interest = total * roi / 12 / 100;
      tempInterest+=interest;
      if((i+1)%coumpoundingFrequency==0 || (i+1)==months){
        total+=tempInterest;
        tempInterest=0;
      }
      if((i+1)%12==0){
        amount = amount * (100+ topupPercent)/100;
      }
    }
    return total;
  }

  private saveData() {
    // save data
    const data = JSON.stringify(this.basicdata);
    console.log(data)

    window.localStorage.setItem('data',data);

    // setInterval(()=>{
    //   this.saveData()
    // },10000)
  }
}

class Expense{

  public expense :string = "";
  public monthlyAmount :number = 0;
  public annualAmount :number = 0;


  constructor(expense?: string) {
    if(expense){
      this.expense = expense;
    }
  }
}


class Investment {

   public item:string = "";
   public initialAmount : number = 0;
   public sip: number = 0;
   public roi : number = 0;
   public term : number = 0;
   public compunding : number = 1;
   public stepUp : number = 0;
   public total : number = 0;


}

function convertToDecimal(num: number) {
    return Math.round(num*100)/100


}

class BasicData {
  constructor(){

  }
  public dateOfBirth : string="";
  public age : number  = 0;
  public retirementAge : number = 0;
  public retirementDate : string  = "";
  public monthsToRetirement : number  = 0;
  public yearsToRetirement : number  = 0;


  public expenses : Array<Expense> = [new Expense("Household Expense")];
  public investment : Array<Investment> = [];


  totalExpensePostRetirement(){
      return convertToDecimal(this.expenses.map( x=> x.annualAmount).reduce((previousValue ,total)=> total+previousValue,0 ))
  }


  // calculate the amount required at retirment

  calculateRetirementAmountSimpleOption(){

    const supportAge = 85;
    const inflationRate = 5;
    const debtReturn = 7;
    const equityReturn = 10;

    // simple reverse calculator

    const inflationAdjustedAmountAtStart = this.totalExpensePostRetirement()*Math.pow((1+inflationRate/100),(this.yearsToRetirement))
    const inflationAdjustedExpenseAtEnd = this.totalExpensePostRetirement()*Math.pow((1+inflationRate/100),(85-this.age-1));



    // iterate over till support age
    /*
    Since the closing Amount = 0 ,
    the opening amount for year#85 = expense
    the closing amount for year#84 = opening amount for year#85
    the finalamount#84 = closing#84/1.07
    interest#84 = closing#84 - finalamount#84
    opening#84 =     finalamount#84 + expense#84


     */


    let closingAmount = 0;

    let expenseStart = inflationAdjustedExpenseAtEnd;
    let openingAmount = 0;

    const expenseTable : Array<any>= [];

    for(let i = 0 ; i <= (supportAge - this.retirementAge); i++){


      if(i==0){
        openingAmount = expenseStart;
        expenseTable.push({
          open :  openingAmount,
          expense : expenseStart,
          final : 0,
          interest : 0,
          close : 0
        });
      }else{
        //expense
        expenseStart = expenseStart / 1.05;
        closingAmount = openingAmount;
        let finalAmount = closingAmount/1.07;
        let interestAmount = closingAmount - finalAmount;
        openingAmount = expenseStart + finalAmount;

        expenseTable.unshift({
          open :  openingAmount,
          expense : expenseStart,
          final : finalAmount,
          interest : interestAmount,
          close : closingAmount
        });
      }

      closingAmount = openingAmount;
    }

    return expenseTable[0].open;



  }



  calculateRetirementAmountSimpleOption2(){
    // This is a smarter way to invest
    // instead of going for a simple interest based calculation
    // we go for a smarter way which allows for greater growth
    // the strategy is to have 7 years expense as a starting buffer.
    // and invest the other amount in equity based funds

  }









}
