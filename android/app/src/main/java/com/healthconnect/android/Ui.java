package com.healthconnect.android;
import android.app.*;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.view.*;
import android.widget.*;
import android.text.InputType;

final class Ui {
    static final int TEAL=Color.rgb(15,118,110), INK=Color.rgb(15,23,42), MUTED=Color.rgb(71,85,105), BG=Color.rgb(244,248,250);
    final Activity activity;
    Ui(Activity activity){this.activity=activity;}
    int dp(float value){return Math.round(value*activity.getResources().getDisplayMetrics().density);}
    LinearLayout column(){LinearLayout layout=new LinearLayout(activity);layout.setOrientation(LinearLayout.VERTICAL);return layout;}
    GradientDrawable shape(int color,int radius){GradientDrawable drawable=new GradientDrawable();drawable.setColor(color);drawable.setCornerRadius(dp(radius));return drawable;}
    TextView text(LinearLayout parent,String text,int size,boolean bold){
        TextView view=new TextView(activity);view.setText(text);view.setTextColor(INK);view.setTextSize(size);view.setTextIsSelectable(false);
        if(bold)view.setTypeface(Typeface.DEFAULT,Typeface.BOLD);view.setPadding(0,dp(4),0,dp(7));parent.addView(view);return view;
    }
    void note(LinearLayout parent,String text){text(parent,text,14,false).setTextColor(MUTED);}
    LinearLayout card(LinearLayout parent){
        LinearLayout card=column();card.setPadding(dp(18),dp(14),dp(18),dp(14));card.setBackground(shape(Color.WHITE,18));card.setElevation(dp(1));
        LinearLayout.LayoutParams params=new LinearLayout.LayoutParams(-1,-2);params.setMargins(0,dp(8),0,dp(8));parent.addView(card,params);return card;
    }
    Button button(LinearLayout parent,String title,Runnable action){
        Button button=new Button(activity);button.setText(title);button.setAllCaps(false);button.setTextSize(14);button.setTextColor(Color.WHITE);button.setBackgroundTintList(android.content.res.ColorStateList.valueOf(TEAL));button.setMinHeight(dp(48));
        LinearLayout.LayoutParams params=new LinearLayout.LayoutParams(-1,-2);params.setMargins(0,dp(3),0,dp(3));parent.addView(button,params);button.setOnClickListener(v->action.run());return button;
    }
    EditText input(LinearLayout parent,String label,String value,int type){
        note(parent,label);EditText input=new EditText(activity);input.setSingleLine(true);input.setText(value);input.setInputType(type);input.setTextSize(16);input.setMinHeight(dp(48));input.setSaveEnabled(false);input.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        input.setContentDescription(label);parent.addView(input,new LinearLayout.LayoutParams(-1,-2));return input;
    }
    EditText input(LinearLayout parent,String label,String value){return input(parent,label,value,InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);}
    Spinner spinner(LinearLayout parent,String label,String[] values){note(parent,label);Spinner view=new Spinner(activity);ArrayAdapter<String> adapter=new ArrayAdapter<>(activity,android.R.layout.simple_spinner_dropdown_item,values);view.setAdapter(adapter);view.setMinimumHeight(dp(48));view.setContentDescription(label);parent.addView(view);return view;}
    CheckBox check(LinearLayout parent,String label,boolean value){CheckBox check=new CheckBox(activity);check.setText(label);check.setTextColor(INK);check.setChecked(value);check.setMinHeight(dp(48));parent.addView(check);return check;}
    void confirm(String title,String message,Runnable yes){new AlertDialog.Builder(activity).setTitle(title).setMessage(message).setNegativeButton("Back",null).setPositiveButton("Confirm",(d,w)->yes.run()).show();}
    void message(String title,String message){if(!activity.isFinishing())new AlertDialog.Builder(activity).setTitle(title).setMessage(message).setPositiveButton("OK",null).show();}
}
