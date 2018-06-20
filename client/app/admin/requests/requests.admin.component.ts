import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Language, TranslationService } from 'angular-l10n';
import { ToastComponent } from '../../shared/toast/toast.component';
import { AuthService } from '../../services/auth.service';
import { RequestService } from '../../services/request.service';
import { Request } from '../../shared/models/request.model';
import { Help } from '../../shared/models/help.model';
import * as $ from 'jquery';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './requests.admin.component.html'
})
export class AdminRequestsComponent implements OnInit {

  requests: Request[] = [];
  isEdit: boolean;
  form: FormGroup;
  isLoading = true;
  msg = '';
  currentReq: Request;
  helps: Array<Help> = [];
  response = '';
  status = '';

  private _id = new FormControl('', []);
  private name = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(50)
  ]);
  private request = new FormControl('', [
    Validators.required
  ]);
  private help = new FormControl('', [
    Validators.required
  ]);

  @Language() lang: string;

  constructor(private fb: FormBuilder,
              public auth: AuthService,
              public toast: ToastComponent,
              private requestService: RequestService,
              public translation: TranslationService) {
  }

  ngOnInit() {
    this.currentReq = new Request();
    this.currentReq._id = null;
    this.getRequests();
    this.buildForm();
    this.createRequest();
  }

  getRequests() {
    this.requestService.getRequests().subscribe(
        data => this.requests = data,
        error => console.log(error),
        () => this.isLoading = false
    );
  }

  createRequest() {
    this.currentReq = new Request();
    this.currentReq._id = null;
    this.isEdit = false;
  }

  editRequest(request: Request) {
    this.currentReq = request;
    this.isEdit = true;
  }

  deleteRequest(request: Request) {
    if (window.confirm(this.translation.translate('_REQUEST_DELETE_CONFIRM_') + ' ' + request.name + '?')) {
      this.requestService.deleteRequest(request).subscribe(
          data => this.toast.setMessage(this.translation.translate('_REQUEST_DELETE_DONE_'), 'success'),
          error => console.log(error),
          () => this.getRequests()
      );
    }
  }

  execRequest() {
    let req = new Request();
    req.request = this.reverseReplacement();
    this.requestService.playRequest(req).subscribe(
        result => {
          this.response = JSON.stringify(result);
        },
        err => {
          this.response = err.error.err;
        }
    );
  }

  onSubmit() {
    let checkReq = this.request.value.match(/\$[0-9\d]+/ig),
        checkHelp = this.help.value.match(/\$[0-9\d]+/ig);
    if (checkReq == null || checkHelp == null) {
      this.msg = this.translation.translate('_REQUEST_ERROR_NO_VARIABLE_');
    } else if (!this.compareRequestHelp(checkReq.sort(), checkHelp.sort())) {
      this.msg = this.translation.translate('_REQUEST_ERROR_DIFFERENT_VARIABLES_');
    } else if (this.duplicatesInArray(checkReq)) {
      this.msg = this.translation.translate('_REQUEST_ERROR_DUP_VARIABLE_');
    } else {
      this.msg = '';
      let req: Request = this.form.value;
      if (this.isEdit) {
        req._id = this.currentReq._id;
        this.requestService.editRequest(req).subscribe(
            res => {
              $('#addRequestModalCloseBtn').click();
              this.toast.setMessage(this.translation.translate('_REQUEST_EDIT_SUCCESS_'), 'success');
              this.getRequests();
            },
            error => this.toast.setMessage(this.translation.translate('_REQUEST_EDIT_FAIL_'), 'danger')
        );
      } else {
        req._id = null;
        this.requestService.addRequest(req).subscribe(
            res => {
              $('#addRequestModalCloseBtn').click();
              this.toast.setMessage(this.translation.translate('_REQUEST_CREATION_SUCCESS_'), 'success');
              this.getRequests();
            },
            error => this.toast.setMessage(this.translation.translate('_REQUEST_CREATION_FAIL_'), 'danger')
        );
      }
    }
  }

  renderCypherAsForm(request: Request) {
    this.currentReq = request;
    this.response = '';
    this.helps.splice(0, this.helps.length);
    let matches = request.help.match(/\$[0-9\d]+/ig),
        sentences = request.help.split(/\$[0-9\d]+/ig);
    for (let i = 0; i < matches.length; i++) {
      let id = matches[i].split('$')[1];
      let h = new Help();
      h.id = id;
      h.sentence = sentences[i];
      this.helps.push(h);
    }
  }

  private reverseReplacement() {
    let matches = this.currentReq.request.match(/\$[0-9\d]+/ig);
    let req = this.currentReq.request;
    for (let i = 0; i < matches.length; i++) {
      let id = '#requestParameter' + matches[i].split('$')[1];
      let val = $(id).val();
      req = req.replace(matches[i], val);
    }
    return req;
  }

  private compareRequestHelp(arrReq, arrHelp) {
    if (arrReq.length !== arrHelp.length) {
      return false;
    }
    for (let i = 0; i < arrHelp.length; i++) {
      if (arrReq[i].compare) {
        if (!arrReq[i].compare(arrHelp[i])) {
          return false;
        }
      } else if (arrReq[i] !== arrHelp[i]) {
        return false;
      }
    }
    return true;
  }

  private duplicatesInArray(arr) {
    for (let i = 0; i <= arr.length; i++) {
      for (let j = i; j <= arr.length; j++) {
        if (i !== j && arr[i] === arr[j]) {
          return true;
        }
      }
    }
    return false;
  }

  private buildForm() {
    this.form = this.fb.group({
      _id: this._id,
      name: this.name,
      request: this.request,
      help: this.help,
    });
  }

}
