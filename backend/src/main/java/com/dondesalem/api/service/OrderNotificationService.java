package com.dondesalem.api.service;

import com.dondesalem.api.domain.CustomerOrder;
import com.dondesalem.api.domain.PaymentMethod;
import com.dondesalem.api.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Notificaciones de pedidos: log siempre; correo SMTP opcional si configurás {@code spring.mail.host}
 * y {@code app.mail.from}.
 */
@Service
public class OrderNotificationService {

  private static final Logger log = LoggerFactory.getLogger(OrderNotificationService.class);

  private final ObjectProvider<JavaMailSender> mailSender;
  private final String mailFrom;
  private final String transferBankInstructions;

  public OrderNotificationService(
      ObjectProvider<JavaMailSender> mailSender,
      @Value("${app.mail.from:}") String mailFrom,
      @Value("${app.transfer.bank-instructions:}") String transferBankInstructions) {
    this.mailSender = mailSender;
    this.mailFrom = mailFrom;
    this.transferBankInstructions = transferBankInstructions != null ? transferBankInstructions : "";
  }

  public void notifyOrderCreated(CustomerOrder order, User user) {
    log.info(
        "Pedido creado: {} | usuario={} | total={} | descuento={}",
        order.getOrderNumber(),
        user.getEmail(),
        order.getTotal(),
        order.getDiscountTotal());
    JavaMailSender sender = mailSender.getIfAvailable();
    if (sender == null || mailFrom == null || mailFrom.isBlank()) {
      return;
    }
    try {
      SimpleMailMessage msg = new SimpleMailMessage();
      msg.setFrom(mailFrom);
      msg.setTo(user.getEmail());
      msg.setSubject("Pedido confirmado " + order.getOrderNumber());
      msg.setText(mailBody(order, transferBankInstructions));
      sender.send(msg);
    } catch (Exception e) {
      log.warn("No se pudo enviar correo de confirmación (el pedido quedó registrado)", e);
    }
  }

  private static String mailBody(CustomerOrder order, String transferBankInstructions) {
    StringBuilder sb = new StringBuilder();
    sb.append("Hola,\n\nRegistramos tu pedido ")
        .append(order.getOrderNumber())
        .append(".\nTotal: ")
        .append(order.getTotal())
        .append(" (incluye envío si aplica).\n\n");
    if (order.getPaymentMethod() == PaymentMethod.TRANSFERENCIA) {
      sb.append(
          "Medio de pago: transferencia bancaria. Cuando transfieras, respondé a este correo o enviá el comprobante (captura o PDF) por el canal que te indique la tienda, con el número de pedido en el asunto o mensaje.\n");
      String bank = transferBankInstructions != null ? transferBankInstructions.trim() : "";
      if (!bank.isEmpty()) {
        sb.append("\nDatos para transferir:\n").append(bank).append("\n");
      }
      sb.append("\n");
    }
    sb.append("Podés consultar el estado en la tienda con tu número de pedido y el email de tu cuenta.\n\n— DondeSalem\n");
    return sb.toString();
  }
}
