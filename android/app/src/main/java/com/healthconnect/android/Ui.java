package com.healthconnect.android;

import android.app.*;
import android.content.res.ColorStateList;
import android.graphics.*;
import android.graphics.drawable.*;
import android.text.InputType;
import android.view.*;
import android.widget.*;

/** Native equivalents of the web client's Tailwind v4 design tokens and components. */
final class Ui {
    static final int TEAL=0xff009689, TEAL_DARK=0xff00786f, INK=0xff0f172b, MUTED=0xff62748e,
        BG=0xfff8fafc, BLUE=0xff155dfc, GREEN=0xff00a63e, ORANGE=0xfff54900,
        PURPLE=0xff9810fa, RED=0xffe7000b;
    final Activity activity;
    final boolean dark;
    final int background,surface,ink,muted,border,soft,tealSoft,accent;
    Ui(Activity activity){
        this.activity=activity;dark=activity.getPreferences(Activity.MODE_PRIVATE).getBoolean("dark-theme",false);
        background=dark?0xff020618:BG;surface=dark?0xff0f172b:Color.WHITE;ink=dark?0xfff1f5f9:INK;
        muted=dark?0xff90a1b9:MUTED;border=dark?0xff1d293d:0xffe2e8f0;soft=dark?0xff1d293d:0xfff1f5f9;
        tealSoft=dark?0xff0b3535:0xfff0fdfa;accent=dark?0xff2dd4bf:TEAL_DARK;
    }
    int dp(float v){return Math.round(v*activity.getResources().getDisplayMetrics().density);}
    LinearLayout column(){LinearLayout l=new LinearLayout(activity);l.setOrientation(LinearLayout.VERTICAL);return l;}
    LinearLayout row(){LinearLayout l=new LinearLayout(activity);l.setGravity(Gravity.CENTER_VERTICAL);return l;}
    GradientDrawable shape(int color,int radius){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));return d;}
    GradientDrawable outlined(int color,int radius){GradientDrawable d=shape(color,radius);d.setStroke(dp(1),border);return d;}
    GradientDrawable healthCard(){GradientDrawable d=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{0xff00bba7,0xff007a55});d.setCornerRadius(dp(16));return d;}
    Drawable ripple(int color,int radius){return new RippleDrawable(ColorStateList.valueOf(0x26009689),shape(color,radius),shape(Color.WHITE,radius));}
    TextView text(LinearLayout parent,String value,int size,boolean bold){
        TextView t=new TextView(activity);t.setText(value);t.setTextColor(ink);t.setTextSize(size);
        t.setTypeface(Typeface.create(bold?"sans-serif-medium":"sans-serif",Typeface.NORMAL));
        t.setIncludeFontPadding(false);t.setLineSpacing(dp(3),1);t.setPadding(0,dp(4),0,dp(8));parent.addView(t);return t;
    }
    void note(LinearLayout parent,String value){text(parent,value,14,false).setTextColor(muted);}
    LinearLayout card(LinearLayout parent){
        LinearLayout c=column();c.setPadding(dp(20),dp(18),dp(20),dp(18));c.setBackground(outlined(surface,16));c.setElevation(dp(1));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(dp(1),dp(8),dp(1),dp(12));parent.addView(c,p);return c;
    }
    Button button(LinearLayout p,String title,Runnable action){return action(p,title,action,false);}
    Button secondary(LinearLayout p,String title,Runnable action){return action(p,title,action,true);}
    private Button action(LinearLayout parent,String title,Runnable action,boolean secondary){
        Button b=new Button(activity);b.setText(title);b.setAllCaps(false);b.setTextSize(14);b.setTypeface(Typeface.create("sans-serif-medium",Typeface.NORMAL));
        b.setTextColor(secondary?accent:Color.WHITE);b.setBackgroundTintList(null);
        b.setBackground(new RippleDrawable(ColorStateList.valueOf(0x26000000),secondary?outlined(surface,12):shape(TEAL,12),shape(Color.WHITE,12)));
        b.setMinHeight(dp(48));b.setMinimumHeight(dp(48));b.setPadding(dp(16),dp(12),dp(16),dp(12));b.setStateListAnimator(null);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,dp(5),0,dp(5));parent.addView(b,p);b.setOnClickListener(v->action.run());return b;
    }
    EditText input(LinearLayout parent,String label,String value,int type){
        note(parent,label);EditText e=new EditText(activity);e.setInputType(type);e.setSingleLine(true);e.setText(value);
        e.setTextSize(16);e.setTextColor(ink);e.setHintTextColor(muted);e.setMinHeight(dp(48));e.setPadding(dp(14),dp(12),dp(14),dp(12));
        StateListDrawable states=new StateListDrawable();GradientDrawable focused=outlined(surface,12);focused.setStroke(dp(2),TEAL);
        states.addState(new int[]{android.R.attr.state_focused},focused);states.addState(new int[]{},outlined(surface,12));e.setBackgroundTintList(null);e.setBackground(states);
        e.setSaveEnabled(false);e.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);e.setContentDescription(label);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,0,0,dp(14));parent.addView(e,p);return e;
    }
    EditText input(LinearLayout p,String label,String value){return input(p,label,value,InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);}
    Spinner spinner(LinearLayout parent,String label,String[] values){
        note(parent,label);Spinner s=new Spinner(activity);
        ArrayAdapter<String> a=new ArrayAdapter<String>(activity,android.R.layout.simple_spinner_dropdown_item,values){
            @Override public View getView(int position,View convert,ViewGroup parent){return style(super.getView(position,convert,parent));}
            @Override public View getDropDownView(int position,View convert,ViewGroup parent){return style(super.getDropDownView(position,convert,parent));}
            private View style(View v){TextView t=(TextView)v;t.setTextColor(ink);t.setBackgroundColor(surface);t.setPadding(dp(14),dp(14),dp(14),dp(14));return t;}
        };
        s.setAdapter(a);s.setBackground(outlined(surface,12));s.setMinimumHeight(dp(48));s.setContentDescription(label);
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,0,0,dp(14));parent.addView(s,p);return s;
    }
    CheckBox check(LinearLayout p,String label,boolean value){CheckBox c=new CheckBox(activity);c.setText(label);c.setTextColor(ink);c.setButtonTintList(ColorStateList.valueOf(TEAL));c.setChecked(value);c.setMinHeight(dp(48));p.addView(c);return c;}
    void divider(LinearLayout p){View v=new View(activity);v.setBackgroundColor(border);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(1));lp.setMargins(0,dp(10),0,dp(12));p.addView(v,lp);}
    void section(LinearLayout parent,String title,String link,Runnable action){
        LinearLayout r=row();TextView name=text(r,title,16,true);name.setLayoutParams(new LinearLayout.LayoutParams(0,-2,1));
        if(action!=null){TextView more=text(r,link,12,true);more.setTextColor(accent);more.setGravity(Gravity.CENTER);more.setMinHeight(dp(48));more.setPadding(dp(8),dp(8),0,dp(8));more.setBackground(ripple(surface,8));more.setOnClickListener(v->action.run());more.setContentDescription(link+" "+title);}
        parent.addView(r);divider(parent);
    }
    void badge(LinearLayout p,String label){TextView t=text(p,label,11,true);t.setTextColor(accent);t.setBackground(shape(tealSoft,20));t.setPadding(dp(10),dp(6),dp(10),dp(6));}
    void empty(LinearLayout p,String glyph,String title,String detail){
        LinearLayout box=column();box.setGravity(Gravity.CENTER);box.setPadding(0,dp(12),0,dp(12));box.addView(icon(glyph,muted),new LinearLayout.LayoutParams(dp(32),dp(32)));
        TextView heading=text(box,title,14,true);heading.setGravity(Gravity.CENTER);TextView description=text(box,detail,12,false);description.setTextColor(muted);description.setGravity(Gravity.CENTER);p.addView(box);
    }
    View icon(String name,int color){return new View(activity){
        final Paint paint=new Paint(3);
        @Override protected void onDraw(Canvas c){
            super.onDraw(c);c.save();c.scale(getWidth()/24f,getHeight()/24f);paint.setColor(color);paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(1.8f);paint.setStrokeCap(Paint.Cap.ROUND);paint.setStrokeJoin(Paint.Join.ROUND);
            switch(name){
                case "menu":line(c,4,6,20,6);line(c,4,12,20,12);line(c,4,18,20,18);break;
                case "close":line(c,6,6,18,18);line(c,18,6,6,18);break;
                case "plus":line(c,12,5,12,19);line(c,5,12,19,12);break;
                case "calendar":c.drawRoundRect(3,5,21,21,2,2,paint);line(c,3,10,21,10);line(c,8,3,8,7);line(c,16,3,16,7);line(c,8,14,10,14);line(c,14,14,16,14);break;
                case "doctor":c.drawCircle(10,7,3,paint);c.drawArc(3,13,17,25,180,180,false,paint);line(c,17,9,17,15);line(c,14,12,20,12);break;
                case "user":c.drawCircle(12,7,4,paint);c.drawArc(4,14,20,28,180,180,false,paint);break;
                case "file":c.drawRoundRect(5,3,19,21,2,2,paint);line(c,9,9,15,9);line(c,9,13,15,13);line(c,9,17,13,17);break;
                case "bag":c.drawRoundRect(4,7,20,21,2,2,paint);c.drawArc(8,2,16,12,180,180,false,paint);break;
                case "shield":path(c,12,3,20,6,19,15,16,19,12,22,8,19,5,15,4,6,12,3);path(c,8,12,11,15,16,10);break;
                case "nfc":c.drawRoundRect(3,4,21,20,3,3,paint);c.drawArc(8,7,17,17,-60,120,false,paint);c.drawArc(6,8,13,16,-60,120,false,paint);break;
                case "bell":path(c,5,17,7,14,7,9,9,5,15,5,17,9,17,14,19,17,5,17);c.drawArc(10,18,14,22,0,180,false,paint);break;
                case "sun":c.drawCircle(12,12,4,paint);for(int i=0;i<8;i++){double a=i*Math.PI/4;line(c,12+(float)Math.cos(a)*8,12+(float)Math.sin(a)*8,12+(float)Math.cos(a)*10,12+(float)Math.sin(a)*10);}break;
                case "moon":path(c,19,15,15,16,10,14,8,10,8,5,4,9,4,15,8,20,14,21,19,18,21,14);break;
                case "heart":path(c,12,21,3,12,3,7,6,4,9,4,12,7,15,4,18,4,21,7,21,12,12,21);break;
                case "activity":path(c,2,12,7,12,10,4,14,20,17,12,22,12);break;
                case "drop":path(c,12,3,5,12,5,17,8,21,16,21,19,17,19,12,12,3);break;
                case "lab":line(c,8,3,16,3);path(c,10,3,10,10,4,20,5,21,19,21,20,20,14,10,14,3);line(c,8,15,16,15);break;
                case "sos":path(c,4,19,6,10,9,6,15,6,18,10,20,19,4,19);line(c,2,22,22,22);line(c,12,1,12,3);line(c,3,4,5,6);line(c,19,6,21,4);break;
                case "hospital":c.drawRect(5,4,19,22,paint);line(c,9,9,15,9);line(c,12,6,12,12);line(c,10,22,10,16);line(c,14,22,14,16);break;
                default:line(c,8,5,16,12);line(c,16,12,8,19);
            }c.restore();
        }
        private void line(Canvas c,float a,float b,float x,float y){c.drawLine(a,b,x,y,paint);}
        private void path(Canvas c,float... xy){Path p=new Path();p.moveTo(xy[0],xy[1]);for(int i=2;i<xy.length;i+=2)p.lineTo(xy[i],xy[i+1]);c.drawPath(p,paint);}
    };}
    View iconButton(String glyph,String description,Runnable action){
        FrameLayout b=new FrameLayout(activity);b.setBackground(ripple(surface,12));b.addView(icon(glyph,muted),new FrameLayout.LayoutParams(dp(22),dp(22),Gravity.CENTER));
        b.setContentDescription(description);b.setFocusable(true);b.setOnClickListener(v->action.run());return b;
    }
    void shortcut(LinearLayout row,String title,String glyph,int color,int tint,Runnable action){
        LinearLayout t=column();t.setGravity(Gravity.CENTER);t.setPadding(dp(8),dp(18),dp(8),dp(14));t.setBackground(outlined(surface,16));t.setElevation(dp(1));
        FrameLayout well=new FrameLayout(activity);well.setBackground(shape(dark?soft:tint,12));well.addView(icon(glyph,color),new FrameLayout.LayoutParams(dp(24),dp(24),Gravity.CENTER));t.addView(well,new LinearLayout.LayoutParams(dp(48),dp(48)));
        TextView label=text(t,title,12,true);label.setGravity(Gravity.CENTER);label.setPadding(0,dp(12),0,dp(2));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-1,1);p.setMargins(dp(6),dp(6),dp(6),dp(6));row.addView(t,p);
        t.setForeground(ripple(Color.TRANSPARENT,16));t.setFocusable(true);t.setContentDescription(title);t.setOnClickListener(v->action.run());
    }
    void navigation(LinearLayout parent,String name,String glyph,boolean selected,Runnable action){
        LinearLayout r=row();r.setPadding(dp(12),dp(10),dp(12),dp(10));r.setMinimumHeight(dp(48));r.setBackground(ripple(selected?tealSoft:surface,8));r.addView(icon(glyph,selected?accent:muted),new LinearLayout.LayoutParams(dp(20),dp(20)));
        TextView label=text(r,name,14,selected);label.setTextColor(selected?accent:muted);label.setPadding(dp(14),dp(4),0,dp(4));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,dp(2),0,dp(2));parent.addView(r,p);r.setFocusable(true);r.setOnClickListener(v->action.run());
    }
    void stat(LinearLayout parent,String title,String glyph,int color,int tint){
        LinearLayout r=row();r.setPadding(dp(12),dp(12),dp(12),dp(12));r.setBackground(shape(dark?soft:tint,12));r.addView(icon(glyph,color),new LinearLayout.LayoutParams(dp(24),dp(24)));
        LinearLayout copy=column();TextView name=text(copy,title,13,true);name.setPadding(dp(10),0,0,dp(4));TextView value=text(copy,"No reading saved",12,false);value.setTextColor(muted);value.setPadding(dp(10),0,0,0);r.addView(copy,new LinearLayout.LayoutParams(0,-2,1));
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,dp(5),0,dp(5));parent.addView(r,p);
    }
    void confirm(String title,String message,Runnable yes){new AlertDialog.Builder(activity).setTitle(title).setMessage(message).setNegativeButton("Back",null).setPositiveButton("Confirm",(d,w)->yes.run()).show();}
    void message(String title,String message){if(!activity.isFinishing())new AlertDialog.Builder(activity).setTitle(title).setMessage(message).setPositiveButton("OK",null).show();}
}
