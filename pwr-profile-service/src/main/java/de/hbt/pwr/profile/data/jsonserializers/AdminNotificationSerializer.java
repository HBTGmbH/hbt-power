package de.hbt.pwr.profile.data.jsonserializers;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import de.hbt.pwr.profile.data.ConsultantRepository;
import de.hbt.pwr.profile.model.Consultant;
import de.hbt.pwr.profile.model.notification.AdminNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
public class AdminNotificationSerializer extends JsonSerializer<AdminNotification> {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    private final ConsultantRepository consultantRepository;

    @Autowired
    public AdminNotificationSerializer(ConsultantRepository consultantRepository) {
        this.consultantRepository = consultantRepository;
    }

    @Override
    public void serialize(AdminNotification notification, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException, JsonProcessingException {
        Optional<Consultant> consultantOptional = consultantRepository.findByProfileId(notification.getProfile().getId());
        String initials = null;
        if (consultantOptional.isPresent()) {
            initials = consultantOptional.get().getInitials();
        }
        jsonGenerator.writeStartObject();
        jsonGenerator.writeNumberField("id", notification.getId());
        jsonGenerator.writeStringField("initials", initials);
        jsonGenerator.writeStringField("reason", notification.getReason().toString());
        jsonGenerator.writeStringField("occurrence", notification.getTimeOfOccurrence().format(formatter));
        jsonGenerator.writeStringField("type", notification.getNotificationType());
        notification.addCustomJSON(jsonGenerator);
        jsonGenerator.writeEndObject();
    }
}
