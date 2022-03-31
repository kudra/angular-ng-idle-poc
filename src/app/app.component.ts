import {
  ChangeDetectorRef,
  Component,
  OnInit,
  VERSION,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // some fields to store our state so we can display it in the UI
  idleState = 'User active and doing something';
  countdown?: number = null;
  timeOutTime: number = 10;
  idleTime: number = 8;
  closeResult:string = null;
  @ViewChild('mymodal') myModal: ElementRef;

  ngOnInit(): void {
    this.reset();
  }
  constructor(
    private idle: Idle, 
    cd: ChangeDetectorRef,
    private modalService: NgbModal
    ) {
    idle.setIdle(this.idleTime); // how long can they be inactive before considered idle, in seconds
    idle.setTimeout(this.timeOutTime); // how long can they be idle before considered timed out, in seconds
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // Provide events indicating the user is active

    // Triiger when the user becomes idle
    idle.onIdleStart.subscribe(() => {
      this.idleState = 'User is idle now';
      // alert('You are idle and will be logged out in 5 seconds');
      this.modalService.open(this.myModal).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      console.log(this.closeResult);
    });

    // Triiger when the user is no longer idle
    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'User active and doing something';
      console.log(`${this.idleState} ${new Date()}`);
      this.countdown = null;
      cd.detectChanges();
    });
    // do something when the user has timed out
    idle.onTimeout.subscribe(() => {
      (this.idleState = 'User logged out');
      this.modalService.dismissAll(this.myModal);
  });
    // do something as the timeout countdown does its thing
    idle.onTimeoutWarning.subscribe((seconds) => (this.countdown = seconds));
  }

  reset():void {
    // reset any component state and be sure to call idle.watch()
    this.idle.watch();
    this.idleState = 'User active and doing something';
    this.countdown = null;
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }

  }

  name = 'Angular ' + VERSION.major;
}
