VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Example"
   ClientHeight    =   2175
   ClientLeft      =   2025
   ClientTop       =   1875
   ClientWidth     =   4335
   LinkTopic       =   "Form1"
   ScaleHeight     =   2175
   ScaleWidth      =   4335
   Begin VB.ListBox lstSibs 
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   1320
      Left            =   1500
      TabIndex        =   9
      Top             =   600
      Width           =   1215
   End
   Begin VB.Timer Timer1 
      Interval        =   10
      Left            =   3300
      Top             =   1080
   End
   Begin VB.CommandButton Command1 
      Caption         =   "Get Info"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   255
      Left            =   180
      TabIndex        =   5
      Top             =   1620
      Width           =   1215
   End
   Begin VB.TextBox txtHandle 
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   315
      Left            =   180
      TabIndex        =   4
      Text            =   "0"
      Top             =   1200
      Width           =   1215
   End
   Begin VB.ListBox lstChilds 
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   1320
      Left            =   2880
      TabIndex        =   1
      Top             =   600
      Width           =   1215
   End
   Begin VB.Frame Frame1 
      Caption         =   "Controls"
      BeginProperty Font 
         Name            =   "Arial"
         Size            =   8.25
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      Height          =   1995
      Left            =   60
      TabIndex        =   0
      Top             =   60
      Width           =   4155
      Begin VB.Label Label5 
         Alignment       =   2  'Center
         Caption         =   "Enter Handle:"
         BeginProperty Font 
            Name            =   "Arial"
            Size            =   8.25
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   120
         TabIndex        =   8
         Top             =   840
         Width           =   1215
      End
      Begin VB.Label lblHandle 
         Alignment       =   2  'Center
         Caption         =   "0"
         BeginProperty Font 
            Name            =   "Arial"
            Size            =   8.25
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   120
         TabIndex        =   7
         Top             =   540
         Width           =   1215
      End
      Begin VB.Label Label3 
         Alignment       =   2  'Center
         Caption         =   "Window Over:"
         BeginProperty Font 
            Name            =   "Arial"
            Size            =   8.25
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   120
         TabIndex        =   6
         Top             =   240
         Width           =   1215
      End
      Begin VB.Label Label2 
         Alignment       =   2  'Center
         Caption         =   "Children"
         BeginProperty Font 
            Name            =   "Arial"
            Size            =   8.25
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   2760
         TabIndex        =   3
         Top             =   240
         Width           =   1215
      End
      Begin VB.Label Label1 
         Alignment       =   2  'Center
         Caption         =   "Siblings"
         BeginProperty Font 
            Name            =   "Arial"
            Size            =   8.25
            Charset         =   0
            Weight          =   400
            Underline       =   0   'False
            Italic          =   0   'False
            Strikethrough   =   0   'False
         EndProperty
         Height          =   255
         Left            =   1440
         TabIndex        =   2
         Top             =   240
         Width           =   1215
      End
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
' Find the Siblings and Children of a Window
' by PAT or JK (Patrick Gillespie)
' 3.25.00
' www.patorjk.com

' This is an example on how to find the handles of all the
' siblings and children that a window has.

Option Explicit

Private Declare Function GetWindow Lib "user32" (ByVal hwnd As Long, ByVal wCmd As Long) As Long
Private Declare Function FindWindow Lib "user32" Alias "FindWindowA" (ByVal lpClassName As String, ByVal lpWindowName As String) As Long
Private Declare Function FindWindowEx Lib "user32" Alias "FindWindowExA" (ByVal hWnd1 As Long, ByVal hWnd2 As Long, ByVal lpsz1 As String, ByVal lpsz2 As String) As Long
Private Declare Function GetCursorPos Lib "user32" (lpPoint As POINTAPI) As Long
Private Declare Function WindowFromPoint Lib "user32" (ByVal xPoint As Long, ByVal yPoint As Long) As Long

Private Const GW_CHILD = 5
Private Const GW_HWNDFIRST = 0
Private Const GW_HWNDNEXT = 2

Private Type POINTAPI
        X As Long
        Y As Long
End Type

Private Sub Command1_Click()
    Dim WinHandle As Long, WH As Long
    WinHandle = Val(txtHandle.Text)
    If WinHandle = 0 Then
        MsgBox "Please enter in the handle of the window.", vbInformation, "Info"
        Exit Sub
    End If
    ' clear the lists of their current contents
    lstSibs.Clear
    lstChilds.Clear
    ' find the sibling windows
    WH = GetWindow(WinHandle, GW_HWNDFIRST)
    Do While WH <> 0
        If WH <> WinHandle Then
            ' make sure we only add its siblings and not
            ' the handle of the window itself
            lstSibs.AddItem WH
        End If
        WH = GetWindow(WH, GW_HWNDNEXT)
    Loop
    ' find the child windows
    WH = GetWindow(WinHandle, GW_CHILD)
    Do While WH <> 0
        lstChilds.AddItem WH
        WH = GetWindow(WH, GW_HWNDNEXT)
    Loop
End Sub

Private Sub Frame1_DragDrop(Source As Control, X As Single, Y As Single)

End Sub

Private Sub Timer1_Timer()
    ' Here we're getting the position of the cursor, then
    ' getting the handle of the window it's over. After we
    ' do that we check to see if it's a different window
    ' from the one it was over the last time we checked. If
    ' so, then we update the label.
    Dim WinOver As Long, WinOld As Long, C As POINTAPI
    Call GetCursorPos(C)
    WinOver = WindowFromPoint(C.X, C.Y)
    If WinOver <> WinOld Then
        lblHandle.Caption = WinOver
    End If
End Sub
