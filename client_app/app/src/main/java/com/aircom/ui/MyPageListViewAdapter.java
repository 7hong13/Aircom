package com.aircom.ui;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.RecyclerView.ViewHolder;

import com.aircom.R;
import com.aircom.data.RetrofitClient;
import com.aircom.data.ServiceAPI;
import com.aircom.data.SharedPreference;
import com.aircom.data.SubTotalData;
import com.aircom.data.SubscribeData;
import com.aircom.data.SubscriptionResponse;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyPageListViewAdapter extends BaseAdapter{
    private static final int ITEM_VIEW_TYPE_ACCOUNT = 0 ;
    private static final int ITEM_VIEW_TYPE_CHARGE_LOGOUT = 1 ;
    private static final int ITEM_VIEW_TYPE_USAGE = 2 ;
    private ArrayList<ListViewItem> listViewItemList = new ArrayList<ListViewItem>() ;
    private TextView mLeftTime;
    private TextView mProvidedTime;
    private Context context;

    public MyPageListViewAdapter(Context context) {
        this.context = context;
    }
    @Override
    public int getCount() {
        return listViewItemList.size() ;
    }

    @Override
    public Object getItem(int i) {
        return listViewItemList.get(i);
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @Override
    public int getViewTypeCount() {
        return 3;
    }

    @Override
    public int getItemViewType(int position) {
        return listViewItemList.get(position).getType();
    }

    @Override
    public View getView(int i, View view, ViewGroup viewGroup) {
        final Context context = viewGroup.getContext();
        int viewType = getItemViewType(i) ;
        if (view == null) {
            LayoutInflater inflater = (LayoutInflater) context
                    .getSystemService(Context.LAYOUT_INFLATER_SERVICE) ;

            // Data Set(listViewItemList)에서 position에 위치한 데이터 참조 획득
            ListViewItem listViewItem = listViewItemList.get(i);
            switch (viewType){
                case ITEM_VIEW_TYPE_ACCOUNT:
                    view = inflater.inflate(R.layout.listview_mypage_account,
                            viewGroup, false);
                    TextView titleTextView = (TextView) view.findViewById(R.id.title) ;
                    TextView accountTextView = (TextView) view.findViewById(R.id.account) ;
                    titleTextView.setText(listViewItem.getTitle());
                    accountTextView.setText(listViewItem.getAccount());
                    break;
                case ITEM_VIEW_TYPE_CHARGE_LOGOUT:
                    view = inflater.inflate(R.layout.listview_mypage_charge_logout,
                            viewGroup, false);
                    TextView titleTextView2 = (TextView) view.findViewById(R.id.title) ;
                    titleTextView2.setText(listViewItem.getTitle());
                    break;
                case ITEM_VIEW_TYPE_USAGE:
                    view = inflater.inflate(R.layout.listview_mypage_usage,
                            viewGroup, false);
                    mLeftTime = (TextView)view.findViewById(R.id.leftTime);
                    mProvidedTime = (TextView)view.findViewById(R.id.providedTime);
                    setRemainTime();
                    break;
            }

        }
        return view;
    }
    // account
    public void addItem(String title, String account) {
        ListViewItem item = new ListViewItem() ;

        item.setType(ITEM_VIEW_TYPE_ACCOUNT);
        item.setTitle(title) ;
        item.setAccount(account) ;
        listViewItemList.add(item) ;
    }
    // charge/logout
    public void addItem(String title) {
        ListViewItem item = new ListViewItem() ;
        item.setType(ITEM_VIEW_TYPE_CHARGE_LOGOUT);
        item.setTitle(title) ;
        listViewItemList.add(item) ;
    }

    public void addItem() {
        ListViewItem item = new ListViewItem() ;
        item.setType(ITEM_VIEW_TYPE_USAGE);
        listViewItemList.add(item) ;
    }

    private void setRemainTime() {
        ServiceAPI service = RetrofitClient.getClient().create(ServiceAPI.class);
        service.subscriptionInfoRequest(SharedPreference.getLoginToken(context))
                .enqueue(new Callback<SubscriptionResponse>() {
                    @Override
                    public void onResponse(Call<SubscriptionResponse> call,
                                           Response<SubscriptionResponse> response) {
                        if (response.code() == 200) {
                            int remainTime = response.body().getRemainTime() / 3600000;

                            SubscriptionResponse res = new SubscriptionResponse(response.body().
                                    getSubscription(), response.body().getRemainTime());

                            if (res.getSubscription() == null){
                                String s = "남은 시간 " + remainTime + "시간";
                                mProvidedTime.setText(s);
                                mProvidedTime.setTextColor(Color.parseColor("#0052cc"));
                            }
                            else {
                                SubTotalData data = new SubTotalData(
                                        res.getSubscription().getSubscribeData(),
                                        res.getSubscription().getSubscriptionData());
                                SubscribeData data2 = new SubscribeData(
                                        data.getSubscribeData().getId(),
                                        data.getSubscribeData().getUserId(),
                                        data.getSubscribeData().getSubscriptionMenuId(),
                                        data.getSubscribeData().getStartDate(),
                                        data.getSubscribeData().getEndDate(),
                                        data.getSubscribeData().getCreatedAt(),
                                        data.getSubscribeData().getUpdatedAt());

                                if (data.getSubscribeData().getSubscriptionMenuId() == 1) {
                                    String s1 = "남은 시간 " + remainTime + "시간";
                                    String s2 = "제공 72시간";
                                    mLeftTime.setText(s1);
                                    mProvidedTime.setText(s2);
                                }
                                else if (data.getSubscribeData().getSubscriptionMenuId() == 2) {
                                    String s1 = "남은 시간 " + remainTime + "시간";
                                    String s2 = "제공 160시간";
                                    mLeftTime.setText(s1);
                                    mProvidedTime.setText(s2);
                                }
                            }
                        }
                        else {
                            Toast.makeText(context, "일시적으로 잔여 시간을 불러올 수 없습니다",
                                    Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<SubscriptionResponse> call, Throwable t) {
                        System.out.println("error: "+t.getMessage());
                    }
                });
    }
}
