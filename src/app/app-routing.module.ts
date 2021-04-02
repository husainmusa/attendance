import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) , canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register-student',
    loadChildren: () => import('./register-student/register-student.module').then( m => m.RegisterStudentPageModule)
  },
  {
    path: 'register-teacher',
    loadChildren: () => import('./register-teacher/register-teacher.module').then( m => m.RegisterTeacherPageModule)
  },
  {
    path: 'school-registration',
    loadChildren: () => import('./school-registration/school-registration.module').then( m => m.SchoolRegistrationPageModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('./about-us/about-us.module').then( m => m.AboutUsPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./news/news.module').then( m => m.NewsPageModule)
  },
  {
    path: 'tabs/news',
    loadChildren: () => import('./news/news.module').then( m => m.NewsPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'classlist',
    loadChildren: () => import('./classlist/classlist.module').then( m => m.ClasslistPageModule)
  },
  {
    path: 'tabs/classlist',
    loadChildren: () => import('./classlist/classlist.module').then( m => m.ClasslistPageModule)
  },
  {
    path: 'delaylist',
    loadChildren: () => import('./delaylist/delaylist.module').then( m => m.DelaylistPageModule)
  },
  {
    path: 'tabs/delaylist',
    loadChildren: () => import('./delaylist/delaylist.module').then( m => m.DelaylistPageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'tabs/messages',
    loadChildren: () => import('./messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'list-student',
    loadChildren: () => import('./list-student/list-student.module').then( m => m.ListStudentPageModule)
  },
  {
    path: 'student-detail',
    loadChildren: () => import('./student-detail/student-detail.module').then( m => m.StudentDetailPageModule)
  },
  {
    path: 'create-class',
    loadChildren: () => import('./create-class/create-class.module').then( m => m.CreateClassPageModule)
  },
  {
    path: 'sendmessage',
    loadChildren: () => import('./sendmessage/sendmessage.module').then( m => m.SendmessagePageModule)
  },
  {
    path: 'tabs/sendmessage',
    loadChildren: () => import('./sendmessage/sendmessage.module').then( m => m.SendmessagePageModule)
  },
  {
    path: 'parentconnect',
    loadChildren: () => import('./parentconnect/parentconnect.module').then( m => m.ParentconnectPageModule)
  },
  {
    path: 'tabs/parentconnect',
    loadChildren: () => import('./parentconnect/parentconnect.module').then( m => m.ParentconnectPageModule)
  },
  {
    path: 'connect-new-message',
    loadChildren: () => import('./connect-new-message/connect-new-message.module').then( m => m.ConnectNewMessagePageModule)
  },
  {
    path: 'connect-chat',
    loadChildren: () => import('./connect-chat/connect-chat.module').then( m => m.ConnectChatPageModule)
  },
  {
    path: 'elearning-schools',
    loadChildren: () => import('./elearning-schools/elearning-schools.module').then( m => m.ElearningSchoolsPageModule)
  },
  {
    path: 'tabs/elearning-schools',
    loadChildren: () => import('./elearning-schools/elearning-schools.module').then( m => m.ElearningSchoolsPageModule)
  },
  {
    path: 'elearning-school-video',
    loadChildren: () => import('./elearning-school-video/elearning-school-video.module').then( m => m.ElearningSchoolVideoPageModule)
  },
  {
    path: 'playvideo',
    loadChildren: () => import('./playvideo/playvideo.module').then( m => m.PlayvideoPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'children',
    loadChildren: () => import('./children/children.module').then( m => m.ChildrenPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'tabs/children',
    loadChildren: () => import('./children/children.module').then( m => m.ChildrenPageModule), canActivate: [AuthGuard]
  },
  {
    path: 'private-message',
    loadChildren: () => import('./private-message/private-message.module').then( m => m.PrivateMessagePageModule)
  },
  {
    path: 'tabs/private-message',
    loadChildren: () => import('./private-message/private-message.module').then( m => m.PrivateMessagePageModule)
  },
  {
    path: 'students',
    loadChildren: () => import('./students/students.module').then( m => m.StudentsPageModule)
  },
  {
    path: 'post-news',
    loadChildren: () => import('./post-news/post-news.module').then( m => m.PostNewsPageModule)
  },
  {
    path: 'parent-register',
    loadChildren: () => import('./parent-register/parent-register.module').then( m => m.ParentRegisterPageModule)
  },
  {
    path: 'edit-calss',
    loadChildren: () => import('./common-modal/edit-calss/edit-calss.module').then( m => m.EditCalssPageModule)
  },
  {
    path: 'requested-parent',
    loadChildren: () => import('./requested-parent/requested-parent.module').then( m => m.RequestedParentPageModule)
  },
  {
    path: 'seminar-list',
    loadChildren: () => import('./seminar-list/seminar-list.module').then( m => m.SeminarListPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'search-student',
    loadChildren: () => import('./search-student/search-student.module').then( m => m.SearchStudentPageModule)
  },
  {
    path: 'student-notes',
    loadChildren: () => import('./student-notes/student-notes.module').then( m => m.StudentNotesPageModule)
  },
  {
    path: 'tabs/student-notes',
    loadChildren: () => import('./student-notes/student-notes.module').then( m => m.StudentNotesPageModule)
  },
  {
    path: 'add-notes',
    loadChildren: () => import('./add-notes/add-notes.module').then( m => m.AddNotesPageModule)
  },
  {
    path: 'view-class-notes',
    loadChildren: () => import('./common-modal/view-class-notes/view-class-notes.module').then( m => m.ViewClassNotesPageModule)
  },
  {
    path: 'manage-teacher',
    loadChildren: () => import('./manage-teacher/manage-teacher.module').then( m => m.ManageTeacherPageModule)
  },
  {
    path: 'edit-teacher-profile',
    loadChildren: () => import('./edit-teacher-profile/edit-teacher-profile.module').then( m => m.EditTeacherProfilePageModule)
  },
  {
    path: 'follow-bulletins',
    loadChildren: () => import('./follow-bulletins/follow-bulletins.module').then( m => m.FollowBulletinsPageModule)
  },
  {
    path: 'bulletins',
    loadChildren: () => import('./bulletins/bulletins.module').then( m => m.BulletinsPageModule)
  },
  {
    path: 'manage-student',
    loadChildren: () => import('./manage-student/manage-student.module').then( m => m.ManageStudentPageModule)
  },
  {
    path: 'edit-student-profile',
    loadChildren: () => import('./edit-student-profile/edit-student-profile.module').then( m => m.EditStudentProfilePageModule)
  },
  {
    path: 'available-plan',
    loadChildren: () => import('./available-plan/available-plan.module').then( m => m.AvailablePlanPageModule)
  },
  {
    path: 'select-bulletins-user',
    loadChildren: () => import('./select-bulletins-user/select-bulletins-user.module').then( m => m.SelectBulletinsUserPageModule)
  },
  {
    path: 'share-bulletins',
    loadChildren: () => import('./share-bulletins/share-bulletins.module').then( m => m.ShareBulletinsPageModule)
  },
  {
    path: 'view-notes',
    loadChildren: () => import('./view-notes/view-notes.module').then( m => m.ViewNotesPageModule)
  },
  {
    path: 'view-bulletin',
    loadChildren: () => import('./view-bulletin/view-bulletin.module').then( m => m.ViewBulletinPageModule)
  },
  {
    path: 'select-message-user',
    loadChildren: () => import('./common-modal/select-message-user/select-message-user.module').then( m => m.SelectMessageUserPageModule)
  },
  {
    path: 'warning-report',
    loadChildren: () => import('./warning-report/warning-report.module').then( m => m.WarningReportPageModule)
  },
  {
    path: 'follow-up-student',
    loadChildren: () => import('./follow-up-student/follow-up-student.module').then( m => m.FollowUpStudentPageModule)
  },
  {
    path: 'add-class',
    loadChildren: () => import('./add-class/add-class.module').then( m => m.AddClassPageModule)
  },
  {
    path: 'followup-student-list',
    loadChildren: () => import('./followup-student-list/followup-student-list.module').then( m => m.FollowupStudentListPageModule)
  },
  {
    path: 'student-report-classes',
    loadChildren: () => import('./student-report-classes/student-report-classes.module').then( m => m.StudentReportClassesPageModule)
  },
  {
    path: 'student-report-list',
    loadChildren: () => import('./student-report-list/student-report-list.module').then( m => m.StudentReportListPageModule)
  },
  {
    path: 'student-report-manage',
    loadChildren: () => import('./student-report-manage/student-report-manage.module').then( m => m.StudentReportManagePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
